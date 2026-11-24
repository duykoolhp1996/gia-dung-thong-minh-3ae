<#
.SYNOPSIS
    TaskFilterRules.ps1 - Module quy tắc chuẩn AI Agent phân loại và tổng hợp công việc Marcom 3AE
.DESCRIPTION
    Tập hợp công việc từ cả 4 sheet (Task Tổng, Content Calendar, Graphic Designer, Video Editor)
    Áp dụng 5 thứ tự ưu tiên & các điều kiện lọc:
    1. Quá hạn (Deadline < ReferenceDate)
    2. Deadline hôm nay (Deadline == ReferenceDate)
    3. Deadline trong 48 giờ (ReferenceDate < Deadline <= ReferenceDate + 2 ngày)
    4. Còn lại trong tuần (Deadline <= Hết Chủ Nhật trong tuần)
    5. Cần bổ sung deadline (Không có ngày hạn chót)
    Loại bỏ khỏi báo cáo nhắc nhở: Đã hoàn thành, Đã hủy, Ngoài tuần.
#>

function Parse-TaskDate([string]$dateStr) {
    if ([string]::IsNullOrWhiteSpace($dateStr)) { return $null }
    $clean = $dateStr.Trim().Split(' ')[0]
    $formats = [string[]]@('dd/MM/yyyy', 'd/M/yyyy', 'dd-MM-yyyy', 'd-M-yyyy', 'yyyy-MM-dd')
    [DateTime]$parsed = [DateTime]::MinValue
    if ([DateTime]::TryParseExact($clean, $formats, [System.Globalization.CultureInfo]::InvariantCulture, [System.Globalization.DateTimeStyles]::None, [ref]$parsed)) {
        return $parsed
    }
    return $null
}

function Format-CleanDate([string]$dateStr) {
    $d = Parse-TaskDate $dateStr
    if ($null -ne $d) {
        return $d.ToString("dd/MM/yyyy")
    }
    return $dateStr.Trim().Split(' ')[0]
}

function Is-TaskCompleted([string]$status) {
    if ([string]::IsNullOrWhiteSpace($status)) { return $false }
    return ($status -like "*hoàn thành*" -or $status -like "*đã duyệt*" -or $status -like "*Đã đăng*" -or $status -like "*5.*" -or $status -like "*6.*" -or $status -like "*8.*")
}

function Is-TaskCancelled([string]$status) {
    if ([string]::IsNullOrWhiteSpace($status)) { return $false }
    return ($status -like "*hủy*" -or $status -like "*cancel*" -or $status -like "*tạm dừng*")
}

function Get-AllDepartmentTasks {
    param(
        [Parameter(Mandatory = $true)]
        $Database
    )

    $allTasks = @()

    # 1. Master Tasks
    if ($Database.master_tasks -and $Database.master_tasks.records) {
        foreach ($t in $Database.master_tasks.records) {
            $name = [string]$t.'Tên công việc / Task'
            if ([string]::IsNullOrWhiteSpace($name)) { continue }
            $assignee = if ($t.'Người phụ trách') { [string]$t.'Người phụ trách' } else { "Chưa gán" }
            $deadline = [string]$t.'Hạn chót (Deadline)'
            $status = if ($t.'Trạng thái') { [string]$t.'Trạng thái' } else { "Chưa bắt đầu" }
            $priority = if ($t.'Mức độ ưu tiên') { [string]$t.'Mức độ ưu tiên' } else { "P2 - Cao" }

            $allTasks += [PSCustomObject]@{
                Id = $t.id
                SheetSource = "Task Tổng"
                Name = $name.Trim()
                Assignee = $assignee.Trim()
                DeadlineStr = (Format-CleanDate $deadline)
                Deadline = (Parse-TaskDate $deadline)
                Status = $status.Trim()
                Priority = $priority.Trim()
                IsDone = (Is-TaskCompleted $status)
                IsCancelled = (Is-TaskCancelled $status)
            }
        }
    }

    # 2. Content Calendar
    if ($Database.content -and $Database.content.records) {
        foreach ($t in $Database.content.records) {
            $name = if ($t.'Tiêu Đề Bài Viết / Kịch Bản') { [string]$t.'Tiêu Đề Bài Viết / Kịch Bản' } else { [string]$t.'Tên bài viết' }
            if ([string]::IsNullOrWhiteSpace($name)) { continue }
            $assignee = if ($t.'Người Thực Hiện') { [string]$t.'Người Thực Hiện' } elseif ($t.'Người thực hiện') { [string]$t.'Người thực hiện' } else { "Mỵ" }
            $deadline = if ($t.'Lịch Đăng (Air Date)') { [string]$t.'Lịch Đăng (Air Date)' } elseif ($t.'Hạn nộp bản thảo') { [string]$t.'Hạn nộp bản thảo' } else { [string]$t.'Hạn chót (Deadline)' }
            $status = if ($t.'Trạng Thái Duyệt') { [string]$t.'Trạng Thái Duyệt' } elseif ($t.'Trạng thái') { [string]$t.'Trạng thái' } else { "Chờ duyệt" }
            $priority = if ($t.'Mức độ ưu tiên') { [string]$t.'Mức độ ưu tiên' } else { "P2 - Cao" }

            $allTasks += [PSCustomObject]@{
                Id = $t.id
                SheetSource = "Content Calendar"
                Name = $name.Trim()
                Assignee = $assignee.Trim()
                DeadlineStr = (Format-CleanDate $deadline)
                Deadline = (Parse-TaskDate $deadline)
                Status = $status.Trim()
                Priority = $priority.Trim()
                IsDone = (Is-TaskCompleted $status)
                IsCancelled = (Is-TaskCancelled $status)
            }
        }
    }

    # 3. Graphic Designer
    if ($Database.designer -and $Database.designer.records) {
        foreach ($t in $Database.designer.records) {
            $name = if ($t.'Tên ấn phẩm / Task Thiết Kế') { [string]$t.'Tên ấn phẩm / Task Thiết Kế' } else { [string]$t.'Tên ấn phẩm / Task' }
            if ([string]::IsNullOrWhiteSpace($name)) { continue }
            $assignee = if ($t.'Người phụ trách') { [string]$t.'Người phụ trách' } else { "Loan Huỳnh" }
            $deadline = [string]$t.'Hạn chót (Deadline)'
            $status = if ($t.'Trạng thái thiết kế') { [string]$t.'Trạng thái thiết kế' } elseif ($t.'Trạng thái') { [string]$t.'Trạng thái' } else { "Đang thực hiện" }
            $priority = if ($t.'Mức độ ưu tiên') { [string]$t.'Mức độ ưu tiên' } else { "P2 - Cao" }

            $allTasks += [PSCustomObject]@{
                Id = $t.id
                SheetSource = "Graphic Designer"
                Name = $name.Trim()
                Assignee = $assignee.Trim()
                DeadlineStr = (Format-CleanDate $deadline)
                Deadline = (Parse-TaskDate $deadline)
                Status = $status.Trim()
                Priority = $priority.Trim()
                IsDone = (Is-TaskCompleted $status)
                IsCancelled = (Is-TaskCancelled $status)
            }
        }
    }

    # 4. Video Editor
    if ($Database.editor -and $Database.editor.records) {
        foreach ($t in $Database.editor.records) {
            $name = if ($t.'Tên Video / Dự án dựng') { [string]$t.'Tên Video / Dự án dựng' } else { [string]$t.'Tên video / Task' }
            if ([string]::IsNullOrWhiteSpace($name)) { continue }
            $assignee = if ($t.'Editor phụ trách') { [string]$t.'Editor phụ trách' } elseif ($t.'Người phụ trách') { [string]$t.'Người phụ trách' } else { "Toàn" }
            $deadline = [string]$t.'Hạn chót bàn giao (Deadline)'
            if ([string]::IsNullOrWhiteSpace($deadline)) { $deadline = [string]$t.'Hạn chót (Deadline)' }
            $status = if ($t.'Trạng thái dựng') { [string]$t.'Trạng thái dựng' } elseif ($t.'Trạng thái') { [string]$t.'Trạng thái' } else { "Đang dựng" }
            $priority = if ($t.'Mức độ ưu tiên') { [string]$t.'Mức độ ưu tiên' } else { "P1 - Khẩn cấp" }

            $allTasks += [PSCustomObject]@{
                Id = $t.id
                SheetSource = "Video Editor"
                Name = $name.Trim()
                Assignee = $assignee.Trim()
                DeadlineStr = (Format-CleanDate $deadline)
                Deadline = (Parse-TaskDate $deadline)
                Status = $status.Trim()
                Priority = $priority.Trim()
                IsDone = (Is-TaskCompleted $status)
                IsCancelled = (Is-TaskCancelled $status)
            }
        }
    }

    return $allTasks
}

function Get-FilteredAndPrioritizedTasks {
    param(
        [array]$RawTasks,
        [DateTime]$ReferenceDate = ([DateTime]::Today),
        [Nullable[DateTime]]$EndOfWeekDate = $null
    )

    if ($null -eq $EndOfWeekDate -or $EndOfWeekDate -eq [DateTime]::MinValue) {
        # Mặc định kết thúc tuần là Chủ Nhật của tuần chứa ReferenceDate
        $daysUntilSunday = (7 - [int]$ReferenceDate.DayOfWeek) % 7
        $EndOfWeekDate = $ReferenceDate.AddDays($daysUntilSunday).Date.AddHours(23).AddMinutes(59).AddSeconds(59)
    }

    $refDateOnly = $ReferenceDate.Date

    $tier1_Overdue = @()          # 1. Quá hạn
    $tier2_Today = @()            # 2. Deadline hôm nay
    $tier3_In48h = @()            # 3. Deadline trong 48 giờ
    $tier4_RestOfWeek = @()       # 4. Còn lại trong tuần
    $tier5_MissingDeadline = @()  # 5. Chưa có deadline / Cần bổ sung
    $excluded_Completed = @()     # Loại: Đã hoàn thành
    $excluded_Cancelled = @()     # Loại: Đã hủy
    $excluded_Future = @()        # Loại: Ngoài tuần

    foreach ($item in $RawTasks) {
        if ([string]::IsNullOrWhiteSpace($item.Name)) { continue }

        if ($item.IsCancelled) {
            $excluded_Cancelled += $item
            continue
        }

        if ($item.IsDone) {
            $excluded_Completed += $item
            continue
        }

        $d = $item.Deadline

        if ($null -eq $d) {
            $item | Add-Member -MemberType NoteProperty -Name "PriorityTier" -Value 5 -Force
            $tier5_MissingDeadline += $item
            continue
        }

        $dDateOnly = $d.Date

        if ($dDateOnly -lt $refDateOnly) {
            $diffDays = ($refDateOnly - $dDateOnly).Days
            $item | Add-Member -MemberType NoteProperty -Name "OverdueDays" -Value $diffDays -Force
            $item | Add-Member -MemberType NoteProperty -Name "PriorityTier" -Value 1 -Force
            $tier1_Overdue += $item
        } elseif ($dDateOnly -eq $refDateOnly) {
            $item | Add-Member -MemberType NoteProperty -Name "PriorityTier" -Value 2 -Force
            $tier2_Today += $item
        } elseif ($dDateOnly -le $refDateOnly.AddDays(2)) {
            $item | Add-Member -MemberType NoteProperty -Name "PriorityTier" -Value 3 -Force
            $tier3_In48h += $item
        } elseif ($dDateOnly -le $EndOfWeekDate.Date) {
            $item | Add-Member -MemberType NoteProperty -Name "PriorityTier" -Value 4 -Force
            $tier4_RestOfWeek += $item
        } else {
            $excluded_Future += $item
        }
    }

    return [PSCustomObject]@{
        ReferenceDate = $ReferenceDate
        EndOfWeekDate = $EndOfWeekDate
        Tier1_Overdue = $tier1_Overdue
        Tier2_Today = $tier2_Today
        Tier3_In48h = $tier3_In48h
        Tier4_RestOfWeek = $tier4_RestOfWeek
        Tier5_MissingDeadline = $tier5_MissingDeadline
        Excluded_Completed = $excluded_Completed
        Excluded_Cancelled = $excluded_Cancelled
        Excluded_Future = $excluded_Future
        TotalActive = ($tier1_Overdue.Count + $tier2_Today.Count + $tier3_In48h.Count + $tier4_RestOfWeek.Count + $tier5_MissingDeadline.Count)
    }
}
