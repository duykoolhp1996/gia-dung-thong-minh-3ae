"""
Tool trích xuất dữ liệu tự động từ Kho Tri Thức Obsidian (Marketing Knowledge Vault)
Dành cho Team Marketing 3AE - Không cần cài thêm thư viện bên ngoài (Zero-dependency).
"""

import os
import re
import json
import csv
from pathlib import Path
from datetime import datetime

VAULT_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = Path(__file__).resolve().parent

def parse_yaml_frontmatter(content: str) -> dict:
    """Trích xuất và parse phần Frontmatter YAML ở đầu file Markdown."""
    if not content.startswith("---"):
        return {}
    parts = content.split("---", 2)
    if len(parts) < 3:
        return {}
    
    yaml_text = parts[1].strip()
    data = {}
    current_key = None
    
    for line in yaml_text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
            
        # Kiểm tra item trong list (bắt đầu bằng - )
        if line.startswith("- ") and current_key:
            val = line[2:].strip().strip('"').strip("'")
            if isinstance(data[current_key], list):
                data[current_key].append(val)
            else:
                data[current_key] = [val]
            continue
            
        # Kiểm tra key: value
        if ":" in line:
            key, val = line.split(":", 1)
            key = key.strip()
            val = val.strip().split("#")[0].strip() # Loại bỏ inline comment
            
            # Xử lý kiểu dữ liệu cơ bản
            if val == "":
                data[key] = []
                current_key = key
            elif val.lower() in ("true", "yes"):
                data[key] = True
                current_key = key
            elif val.lower() in ("false", "no"):
                data[key] = False
                current_key = key
            else:
                # Thử parse int / float
                try:
                    if "." in val:
                        data[key] = float(val)
                    else:
                        data[key] = int(val)
                except ValueError:
                    data[key] = val.strip('"').strip("'")
                current_key = key
                
    return data

def extract_all_vault_data():
    """Quét toàn bộ Vault và trích xuất dữ liệu theo từng phân loại."""
    extracted = {
        "metadata": {
            "vault_path": str(VAULT_DIR),
            "extracted_at": datetime.now().isoformat(),
            "total_files_scanned": 0
        },
        "campaigns": [],
        "content_scripts": [],
        "personas": [],
        "reports": [],
        "all_notes": []
    }
    
    for root, _, files in os.walk(VAULT_DIR):
        # Bỏ qua thư mục scripts và các thư mục ẩn (.obsidian, .git)
        rel_root = os.path.relpath(root, VAULT_DIR)
        if rel_root.startswith(".") or rel_root.startswith("scripts"):
            continue
            
        for file in files:
            if not file.endswith(".md"):
                continue
                
            file_path = Path(root) / file
            rel_path = file_path.relative_to(VAULT_DIR)
            extracted["metadata"]["total_files_scanned"] += 1
            
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
            except Exception as e:
                print(f"Lỗi đọc file {rel_path}: {e}")
                continue
                
            frontmatter = parse_yaml_frontmatter(content)
            doc_type = frontmatter.get("type", "note")
            
            note_summary = {
                "file_name": file,
                "relative_path": str(rel_path).replace("\\", "/"),
                "type": doc_type,
                "frontmatter": frontmatter
            }
            
            extracted["all_notes"].append(note_summary)
            
            if doc_type == "campaign":
                extracted["campaigns"].append({
                    "id": frontmatter.get("id", file),
                    "title": frontmatter.get("title", file),
                    "status": frontmatter.get("status", "unknown"),
                    "department": frontmatter.get("department", "MarCom"),
                    "budget_vnd": frontmatter.get("budget_vnd", 0),
                    "actual_spend_vnd": frontmatter.get("actual_spend_vnd", 0),
                    "actual_revenue_vnd": frontmatter.get("actual_revenue_vnd", 0),
                    "target_roas": frontmatter.get("target_roas", 0.0),
                    "roas_actual": round(frontmatter.get("actual_revenue_vnd", 0) / max(frontmatter.get("actual_spend_vnd", 1), 1), 2),
                    "start_date": str(frontmatter.get("start_date", "")),
                    "end_date": str(frontmatter.get("end_date", "")),
                    "channels": frontmatter.get("channels", []),
                    "file_path": str(rel_path).replace("\\", "/")
                })
            elif doc_type == "content_script":
                extracted["content_scripts"].append({
                    "id": frontmatter.get("id", file),
                    "title": frontmatter.get("title", file),
                    "channel": frontmatter.get("channel", "TikTok"),
                    "product": frontmatter.get("product", ""),
                    "status": frontmatter.get("status", "draft"),
                    "views": frontmatter.get("views", 0),
                    "file_path": str(rel_path).replace("\\", "/")
                })
            elif doc_type == "persona":
                extracted["personas"].append({
                    "name": frontmatter.get("name", file),
                    "age_range": frontmatter.get("age_range", ""),
                    "priority_products": frontmatter.get("priority_products", []),
                    "file_path": str(rel_path).replace("\\", "/")
                })
            elif doc_type == "weekly_report":
                extracted["reports"].append({
                    "week_number": frontmatter.get("week_number", 0),
                    "year": frontmatter.get("year", 2026),
                    "total_revenue_vnd": frontmatter.get("total_revenue_vnd", 0),
                    "total_ad_spend_vnd": frontmatter.get("total_ad_spend_vnd", 0),
                    "overall_roas": frontmatter.get("overall_roas", 0.0),
                    "file_path": str(rel_path).replace("\\", "/")
                })
                
    return extracted

def main():
    print("=" * 60)
    print("🚀 BẮT ĐẦU TRÍCH XUẤT DỮ LIỆU TỪ MARKETING KNOWLEDGE VAULT...")
    print("=" * 60)
    
    data = extract_all_vault_data()
    
    # 1. Xuất file JSON
    json_path = OUTPUT_DIR / "extracted_marketing_data.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ Đã xuất JSON: {json_path}")
    
    # 2. Xuất file CSV cho các chiến dịch (Campaigns)
    csv_path = OUTPUT_DIR / "campaigns_report.csv"
    if data["campaigns"]:
        fieldnames = ["id", "title", "status", "department", "budget_vnd", "actual_spend_vnd", "actual_revenue_vnd", "target_roas", "roas_actual", "start_date", "end_date", "channels", "file_path"]
        with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for c in data["campaigns"]:
                c_copy = dict(c)
                if isinstance(c_copy.get("channels"), list):
                    c_copy["channels"] = "; ".join(c_copy["channels"])
                writer.writerow(c_copy)
        print(f"✅ Đã xuất CSV: {csv_path}")
        
    # In báo cáo tóm tắt
    print("\n📊 BÁO CÁO THỐNG KÊ KHO TRI THỨC:")
    print(f"- Tổng số tài liệu: {data['metadata']['total_files_scanned']}")
    print(f"- Chiến dịch ghi nhận: {len(data['campaigns'])}")
    print(f"- Kịch bản nội dung: {len(data['content_scripts'])}")
    print(f"- Chân dung khách hàng: {len(data['personas'])}")
    print(f"- Báo cáo hiệu suất: {len(data['reports'])}")
    
    # Tính tổng ngân sách & doanh thu từ các chiến dịch
    total_budget = sum(c["budget_vnd"] for c in data["campaigns"])
    total_revenue = sum(c["actual_revenue_vnd"] for c in data["campaigns"])
    print(f"\n💰 TỔNG HỢP CHIẾN DỊCH:")
    print(f"  • Tổng ngân sách dự toán: {total_budget:,.0f} VNĐ")
    print(f"  • Doanh thu thực tế đã ghi nhận: {total_revenue:,.0f} VNĐ")
    print("=" * 60)

if __name__ == "__main__":
    main()
