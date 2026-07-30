import os

dir_path = r"F:\parto\content\project synopsis"
os.makedirs(dir_path, exist_ok=True)

app_html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parto EMMS App - Detailed Specifications</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; color: #333; background-color: #f9fafb; margin: 0; padding: 30px; line-height: 1.6; }
        .container { max-width: 1400px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
        .header h1 { font-size: 32px; color: #111827; margin: 0 0 10px; letter-spacing: -0.5px; }
        .header p { font-size: 16px; color: #6b7280; margin: 0; }
        .grid-row { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; border-bottom: 1px solid #f3f4f6; padding-bottom: 20px; break-inside: avoid; }
        .grid-row:last-child { border-bottom: none; }
        .col-en { direction: ltr; text-align: left; }
        .col-ar { font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; font-size: 15px; }
        h3 { color: #2563eb; font-size: 18px; margin-top: 0; margin-bottom: 15px; }
        p, ul { font-size: 14px; color: #4b5563; margin-top: 0; margin-bottom: 15px; }
        ul { padding-left: 20px; padding-right: 0; }
        .col-ar ul { padding-right: 20px; padding-left: 0; }
        li { margin-bottom: 8px; }
        strong { color: #111827; }
        .highlight { background-color: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .col-ar .highlight { border-left: none; border-right: 4px solid #3b82f6; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Parto EMMS Platform | منصة بارتو لإدارة المعدات</h1>
        <p>Detailed App Specifications & Workflow | المواصفات التفصيلية وآلية العمل</p>
    </div>

    <!-- Section 1 -->
    <div class="grid-row">
        <div class="col-en">
            <h3>1. Project Overview</h3>
            <p>An Equipment Maintenance Management System (EMMS) tailored for the automotive sector. It allows vendors to manage their equipment, track maintenance schedules, handle repair requests, and monitor overall equipment health in real time.</p>
        </div>
        <div class="col-ar">
            <h3>1. نظرة عامة على المشروع</h3>
            <p>نظام إدارة صيانة المعدات (EMMS) مخصص لقطاع السيارات. يتيح للموردين إدارة معداتهم، تتبع جداول الصيانة، التعامل مع طلبات الإصلاح، ومراقبة حالة المعدات العامة في الوقت الفعلي.</p>
        </div>
    </div>

    <!-- Section 2 -->
    <div class="grid-row">
        <div class="col-en">
            <h3>2. User Experience & Workflow</h3>
            <ul>
                <li><strong>Equipment Dashboard:</strong> Vendors can view a comprehensive list of all their equipment and current statuses.</li>
                <li><strong>Maintenance Requests:</strong> Users can log new maintenance or repair requests with descriptions and priority levels.</li>
                <li><strong>Scheduling:</strong> Preventive maintenance tasks are scheduled automatically based on equipment usage or time intervals.</li>
            </ul>
        </div>
        <div class="col-ar">
            <h3>2. تجربة المستخدم وآلية العمل</h3>
            <ul>
                <li><strong>لوحة تحكم المعدات:</strong> يمكن للموردين عرض قائمة شاملة لجميع معداتهم وحالاتها الحالية.</li>
                <li><strong>طلبات الصيانة:</strong> يمكن للمستخدمين تسجيل طلبات صيانة أو إصلاح جديدة مع الوصف ومستويات الأهمية.</li>
                <li><strong>الجدولة:</strong> تتم جدولة مهام الصيانة الوقائية تلقائيًا بناءً على استخدام المعدات أو الفترات الزمنية.</li>
            </ul>
        </div>
    </div>

    <!-- Section 3 -->
    <div class="grid-row">
        <div class="col-en highlight">
            <h3>3. Inventory & Spare Parts</h3>
            <p>Integrated inventory management:</p>
            <ul>
                <li><strong>Stock Tracking:</strong> Real-time tracking of spare parts and components used during maintenance.</li>
                <li><strong>Low Stock Alerts:</strong> Automatic notifications when stock levels fall below a minimum threshold.</li>
                <li><strong>Vendor Integration:</strong> Direct connection to parts suppliers to automate reordering.</li>
            </ul>
        </div>
        <div class="col-ar highlight">
            <h3>3. المخزون وقطع الغيار</h3>
            <p>إدارة مخزون متكاملة:</p>
            <ul>
                <li><strong>تتبع المخزون:</strong> تتبع حي لقطع الغيار والمكونات المستخدمة أثناء الصيانة.</li>
                <li><strong>تنبيهات نقص المخزون:</strong> إشعارات تلقائية عند انخفاض مستويات المخزون عن الحد الأدنى.</li>
                <li><strong>تكامل الموردين:</strong> اتصال مباشر بموردي القطع لأتمتة إعادة الطلب.</li>
            </ul>
        </div>
    </div>
</div>
</body>
</html>
"""

dev_html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parto EMMS App - Development Cost</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; color: #333; background-color: #f9fafb; margin: 0; padding: 30px; line-height: 1.6; }
        .container { max-width: 1400px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
        .header h1 { font-size: 32px; color: #111827; margin: 0 0 10px; letter-spacing: -0.5px; }
        .header p { font-size: 16px; color: #6b7280; margin: 0; }
        .grid-row { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; border-bottom: 1px solid #f3f4f6; padding-bottom: 20px; break-inside: avoid; }
        .grid-row:last-child { border-bottom: none; }
        .col-en { direction: ltr; text-align: left; }
        .col-ar { font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; font-size: 15px; }
        h3 { color: #2563eb; font-size: 18px; margin-top: 0; margin-bottom: 15px; }
        p, ul { font-size: 14px; color: #4b5563; margin-top: 0; margin-bottom: 15px; }
        ul { padding-left: 20px; padding-right: 0; }
        .col-ar ul { padding-right: 20px; padding-left: 0; }
        li { margin-bottom: 8px; }
        strong { color: #111827; }
        .highlight { background-color: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .col-ar .highlight { border-left: none; border-right: 4px solid #3b82f6; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Parto EMMS App - Development Plan & Cost</h1>
        <p>خطة التطوير والتكلفة لتطبيق بارتو</p>
    </div>

    <div class="grid-row">
        <div class="col-en">
            <h3>1. Phase 1: MVP Development</h3>
            <ul>
                <li>UI/UX Design for Web and Mobile</li>
                <li>Core EMMS Engine (Equipment, Maintenance Requests)</li>
                <li>Basic Reporting</li>
            </ul>
            <p><strong>Timeline:</strong> 8 Weeks</p>
            <p><strong>Estimated Cost:</strong> $15,000</p>
        </div>
        <div class="col-ar">
            <h3>1. المرحلة الأولى: تطوير النسخة الأولية</h3>
            <ul>
                <li>تصميم واجهة وتجربة المستخدم للويب والموبايل</li>
                <li>محرك النظام الأساسي (المعدات، طلبات الصيانة)</li>
                <li>تقارير أساسية</li>
            </ul>
            <p><strong>المدة الزمنية:</strong> 8 أسابيع</p>
            <p><strong>التكلفة التقديرية:</strong> 15,000$</p>
        </div>
    </div>
</div>
</body>
</html>
"""

import re

# Insert dev_content into app_html before closing container
dev_content_match = re.search(r'<div class=["\']container["\']>(.*?)</div>\s*</body>', dev_html_content, re.DOTALL)
if dev_content_match:
    dev_content = dev_content_match.group(1)
    dev_content = re.sub(r'<div class=["\']header["\']>.*?</div>', "", dev_content, flags=re.DOTALL)
    combined_html = re.sub(r"</div>\s*</body>", dev_content + r"\n</div>\n</body>", app_html_content)
else:
    combined_html = app_html_content

with open(os.path.join(dir_path, "app_specifications.html"), "w", encoding="utf-8") as f:
    f.write(app_html_content)

with open(os.path.join(dir_path, "dev_cost.html"), "w", encoding="utf-8") as f:
    f.write(dev_html_content)

with open(os.path.join(dir_path, "combined.html"), "w", encoding="utf-8") as f:
    f.write(combined_html)

# Convert to PDF
try:
    import pdfkit
    pdfkit.from_file(os.path.join(dir_path, "combined.html"), os.path.join(dir_path, "Parto_EMMS_Project_Synopsis.pdf"))
except Exception as e:
    print(f"pdfkit not available: {e}. Trying via playwright or simple PDF gen.")
    
print("HTML generated successfully.")
