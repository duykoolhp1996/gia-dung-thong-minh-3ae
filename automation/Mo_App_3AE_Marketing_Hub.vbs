Set WshShell = CreateObject("WScript.Shell")
strCurDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.Run Chr(34) & strCurDir & "\Mo_App_3AE_Marketing_Hub.bat" & Chr(34), 0, False
Set WshShell = Nothing
