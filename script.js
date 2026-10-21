<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة تحكم الإدارة الشاملة</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container" style="max-width: 850px;">
        <div class="admin-badge" style="background: rgba(239, 68, 68, 0.1); color: var(--accent-red);">🔐 لوحة الإدارة العليا</div>
        <h2>لوحة التحكم والتحكم السحابي للمواد</h2>

        <!-- إدارة المواد وحالة الحضور -->
        <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px; color: #38bdf8;">📚 إدارة المواد والمحاضرة</h3>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <input type="text" id="newSubjectInput" placeholder="أدخل اسم مادة جديدة..." style="flex: 2; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: #fff; border-radius: 8px;">
                <button type="button" class="btn" onclick="addNewSubject()" style="flex: 1; background: #10b981;">➕ إضافة مادة</button>
            </div>

            <div class="input-group">
                <label>اختر المادة الحالية:</label>
                <select id="adminSubjectSelect" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: #fff; border-radius: 8px; margin-bottom: 8px;"></select>
                <button type="button" class="btn" onclick="deleteSelectedSubject()" style="background: var(--accent-red); padding: 5px 10px; font-size: 12px; margin-bottom: 15px;">🗑️ حذف المادة المحددة</button>
            </div>

            <div class="input-group">
                <label>عنوان المحاضرة:</label>
                <input type="text" id="adminCurrentSubject" placeholder="مثال: المحاضرة الأولى">
            </div>
            
            <button type="button" class="btn" onclick="saveSubjectAndSettings()" style="background: #4f46e5; margin-bottom: 15px;">💾 حفظ وتحديث اسم المحاضرة والمادة</button>

            <div style="margin-bottom: 15px;">
                <label style="display:block; margin-bottom:5px; font-size:14px; color:var(--text-sub);">التحكم في فتح/إغلاق تسجيل الحضور للمادة:</label>
                <div style="display: flex; gap: 10px;">
                    <button type="button" id="btnToggleAttendance" class="btn" onclick="toggleAttendanceState()" style="flex:1;">🟢 فتح / إغلاق الحضور</button>
                </div>
                <p id="attendanceStatusIndicator" style="margin-top: 8px; font-weight: bold; font-size: 13px;"></p>
            </div>
        </div>

        <!-- سجل الحضور الحي -->
        <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px; color: #10b981;">📊 سجل الحضور الحي</h3>
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                <button type="button" class="btn btn-secondary" onclick="loadLiveAttendanceLog()" style="flex:1;">🔄 تحديث السجل</button>
                <button type="button" class="btn" onclick="endLectureAndExport()" style="background: var(--accent-red); flex:1;">🛑 إنهاء وأرشفة التقرير</button>
            </div>
            <div id="liveAttendanceContainer" style="overflow-x: auto; max-height: 250px;">
                <p style="color: var(--text-sub);">اضغط على تحديث لفتح الكشف...</p>
            </div>
        </div>

        <!-- الأرشيف -->
        <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px; color: #38bdf8;">📁 أرشيف التقارير</h3>
            <div style="display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
                <button type="button" class="btn btn-secondary" onclick="loadArchiveReports()" style="flex:1;">🔄 تحديث الأرشيف</button>
                <button type="button" class="btn" onclick="downloadArchive()" style="background: #10b981; flex:1;">📥 تحميل الأرشيف</button>
                <button type="button" class="btn" onclick="clearArchive()" style="background: var(--accent-red); flex:1;">🗑️ مسح الكافية</button>
            </div>
            <div id="archiveContainer" style="overflow-x: auto; max-height: 200px;">
                <p style="color: var(--text-sub);">اضغط على تحديث لعرض الأرشيف...</p>
            </div>
        </div>

        <!-- إدارة الطلاب الشاملة -->
        <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px; color: #38bdf8;">📋 إدارة بيانات الطلاب (تعديل كامل وحساب الحضور)</h3>
            <button type="button" class="btn btn-secondary" onclick="loadStudentsList()" style="margin-bottom: 10px;">🔄 تحديث قائمة الطلاب</button>
            <div id="studentsTableContainer" style="overflow-x: auto; max-height: 350px;">
                <p style="color: var(--text-sub);">اضغط على تحديث لعرض الطلاب...</p>
            </div>
        </div>

        <p id="adminStatusMsg" class="status-msg"></p>
        <button type="button" class="btn btn-secondary" onclick="window.location.href='subjects.html'">العودة للمواد</button>
    </div>

    <script src="script.js"></script>
    <script>
        let currentAttendanceState = "true";

        window.onload = async function() {
            const pass = prompt("🔐 أدخل الرقم السري للإدارة:");
            if (pass !== "44554455") {
                alert("❌ الرقم السري غير صحيح!");
                window.location.href = 'subjects.html';
                return;
            }

            loadSubjectsIntoAdminDropdown();

            try {
                const settings = await fetchAppSettings();
                if(settings) {
                    if(settings.currentSubject) document.getElementById('adminCurrentSubject').value = settings.currentSubject;
                    if(settings.selectedSubject) document.getElementById('adminSubjectSelect').value = settings.selectedSubject;
                    currentAttendanceState = settings.isAttendanceOpen !== undefined ? String(settings.isAttendanceOpen) : "true";
                    updateAttendanceIndicator();
                }
            } catch(e) {}

            loadLiveAttendanceLog();
            loadArchiveReports();
            loadStudentsList();
        };

        function getSavedSubjects() {
            let subs = JSON.parse(localStorage.getItem('customSubjectsList'));
            if (!subs || !Array.isArray(subs) || subs.length === 0) {
                subs = ["نشأة وسائل الاتصال - د. مصطفى مندي"];
                localStorage.setItem('customSubjectsList', JSON.stringify(subs));
            }
            return subs;
        }

        function loadSubjectsIntoAdminDropdown() {
            const select = document.getElementById('adminSubjectSelect');
            const subs = getSavedSubjects();
            select.innerHTML = "";
            subs.forEach(sub => {
                const opt = document.createElement('option');
                opt.value = sub;
                opt.textContent = sub;
                select.appendChild(opt);
            });
        }

        function addNewSubject() {
            const input = document.getElementById('newSubjectInput');
            const val = input.value.trim();
            if(!val) { alert("أدخل اسم المادة!"); return; }
            let subs = getSavedSubjects();
            if(subs.includes(val)) { alert("المادة موجودة مسبقاً!"); return; }
            subs.push(val);
            localStorage.setItem('customSubjectsList', JSON.stringify(subs));
            input.value = "";
            loadSubjectsIntoAdminDropdown();
            document.getElementById('adminSubjectSelect').value = val;
            alert("✔️ تمت إضافة المادة بنجاح!");
        }

        function deleteSelectedSubject() {
            const select = document.getElementById('adminSubjectSelect');
            const val = select.value;
            let subs = getSavedSubjects();
            if(subs.length <= 1) { alert("يجب أن تبقى مادة واحدة على الأقل!"); return; }
            if(confirm(`حذف المادة "${val}"؟`)) {
                subs = subs.filter(s => s !== val);
                localStorage.setItem('customSubjectsList', JSON.stringify(subs));
                loadSubjectsIntoAdminDropdown();
                alert("🗑️ تم حذف المادة بنجاح!");
            }
        }

        function updateAttendanceIndicator() {
            const indicator = document.getElementById('attendanceStatusIndicator');
            const btn = document.getElementById('btnToggleAttendance');
            if(String(currentAttendanceState).trim() === "true") {
                indicator.style.color = "var(--accent-green)";
                indicator.textContent = "🟢 الحالة: تسجيل الحضور مفتوح حالياً للطالب.";
                btn.textContent = "🔴 إغلاق تسجيل الحضور";
                btn.style.background = "var(--accent-red)";
            } else {
                indicator.style.color = "var(--accent-red)";
                indicator.textContent = "🔴 الحالة: تسجيل الحضور مغلق حالياً.";
                btn.textContent = "🟢 فتح تسجيل الحضور";
                btn.style.background = "var(--accent-green)";
            }
        }

        async function saveSubjectAndSettings() {
            const subjectName = document.getElementById('adminSubjectSelect').value;
            const lectureTitle = document.getElementById('adminCurrentSubject').value.trim() || "المحاضرة الأولى";
            await updateCloudSettings({
                selectedSubject: subjectName,
                currentSubject: lectureTitle,
                isAttendanceOpen: String(currentAttendanceState)
            });
        }

        async function toggleAttendanceState() {
            currentAttendanceState = (String(currentAttendanceState).trim() === "true") ? "false" : "true";
            const subjectName = document.getElementById('adminSubjectSelect').value;
            const lectureTitle = document.getElementById('adminCurrentSubject').value.trim() || "المحاضرة الأولى";
            
            await updateCloudSettings({
                selectedSubject: subjectName,
                currentSubject: lectureTitle,
                isAttendanceOpen: String(currentAttendanceState)
            });
            updateAttendanceIndicator();
        }

        async function updateCloudSettings(settingsObj) {
            const statusMsg = document.getElementById('adminStatusMsg');
            statusMsg.style.color = "#38bdf8";
            statusMsg.textContent = "⏳ جاري حفظ وتأكيد الحالة في السحابة...";

            try {
                await fetch(`${sheetDBUrl}?sheet=Setting`, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: [settingsObj] })
                });
                statusMsg.style.color = "var(--accent-green)";
                statusMsg.textContent = "✅ تم حفظ التحديث في الشيت بنجاح!";
                alert("✔️ تم الحفظ والتحديث بنجاح!");
            } catch (e) {
                statusMsg.style.color = "var(--accent-red)";
                statusMsg.textContent = "❌ خطأ في الاتصال بالسحابة.";
            }
        }

        async function loadLiveAttendanceLog() {
            const container = document.getElementById('liveAttendanceContainer');
            container.innerHTML = "جاري التحميل...";
            try {
                const res = await fetch(`${sheetDBUrl}?sheet=attendance`, { cache: "no-store" });
                const data = await res.json();
                if(!Array.isArray(data) || data.length === 0) {
                    container.innerHTML = "<p style='color:var(--text-sub);'>لا توجد سجلات حضور حي حالياً.</p>";
                    return;
                }
                let html = `<table style="width:100%; border-collapse:collapse; font-size:13px;"><tr style="background:rgba(255,255,255,0.05); text-align:right;"><th>الاسم</th><th>المادة</th><th>الوقت</th><th>إجراء</th></tr>`;
                data.forEach(row => {
                    if(row.name) {
                        html += `<tr style="border-bottom:1px solid var(--border-color);"><td>${row.name}</td><td>${row.subject || '-'}</td><td>${row.time || '-'}</td><td><button onclick="deleteAttendanceRow('${row.name}')" style="background:var(--accent-red); color:#fff; border:none; padding:3px 6px; border-radius:4px;">حذف</button></td></tr>`;
                    }
                });
                html += `</table>`;
                container.innerHTML = html;
            } catch(e) { 
                container.innerHTML = "<p style='color:var(--text-sub);'>لا توجد سجلات حضور حي.</p>"; 
            }
        }

        async function deleteAttendanceRow(name) {
            if(confirm(`حذف الطالب ${name} من كشف الحضور الحالي؟`)) {
                await fetch(`${sheetDBUrl}/name/${encodeURIComponent(name)}?sheet=attendance`, { method: 'DELETE' }).catch(()=>{});
                loadLiveAttendanceLog();
            }
        }

        async function endLectureAndExport() {
            if(confirm("🛑 إنهاء المحاضرة وأرشفة كافة الأسماء بالسجل؟")) {
                try {
                    const res = await fetch(`${sheetDBUrl}?sheet=attendance`, { cache: "no-store" });
                    const list = await res.json();
                    if(Array.isArray(list) && list.length > 0) {
                        const entry = {
                            lectureName: `${document.getElementById('adminSubjectSelect').value} - ${document.getElementById('adminCurrentSubject').value || 'المحاضرة الأولى'}`,
                            date: new Date().toLocaleString('ar-EG'),
                            totalStudents: list.length,
                            details: JSON.stringify(list.map(a => a.name))
                        };
                        
                        // حفظ في صفحة الأرشيف
                        await fetch(`${sheetDBUrl}?sheet=Archive`, {
                            method: 'POST',
                            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                            body: JSON.stringify({ data: [entry] })
                        }).catch(()=>{});

                        // مسح الكشف الحي
                        for(let row of list) {
                            if(row.name) await fetch(`${sheetDBUrl}/name/${encodeURIComponent(row.name)}?sheet=attendance`, { method: 'DELETE' }).catch(()=>{});
                        }
                    }
                    alert("📊 تم إنهاء المحاضرة ونقل التقرير للأرشيف بنجاح!");
                    loadLiveAttendanceLog();
                    loadArchiveReports();
                } catch(e) { alert("حدث خطأ أثناء الأرشفة."); }
            }
        }

        async function loadArchiveReports() {
            const container = document.getElementById('archiveContainer');
            container.innerHTML = "جاري التحميل...";
            try {
                const res = await fetch(`${sheetDBUrl}?sheet=Archive`, { cache: "no-store" });
                const data = await res.json();
                if(!Array.isArray(data) || data.length === 0) {
                    container.innerHTML = "<p style='color:var(--text-sub);'>الأرشيف فارغ حالياً.</p>";
                    return;
                }
                let html = `<table style="width:100%; border-collapse:collapse; font-size:13px;"><tr style="background:rgba(255,255,255,0.05); text-align:right;"><th>المحاضرة</th><th>التاريخ</th><th>العدد</th><th>حذف</th></tr>`;
                data.forEach(row => {
                    if(row.lectureName) {
                        html += `<tr style="border-bottom:1px solid var(--border-color);"><td>${row.lectureName}</td><td>${row.date || '-'}</td><td>${row.totalStudents || 0}</td><td><button onclick="deleteArchiveItem('${row.lectureName}')" style="background:var(--accent-red); color:#fff; border:none; padding:3px 6px; border-radius:4px;">حذف</button></td></tr>`;
                    }
                });
                html += `</table>`;
                container.innerHTML = html;
            } catch(e) { 
                container.innerHTML = "<p style='color:var(--text-sub);'>الأرشيف فارغ حالياً.</p>"; 
            }
        }

        async function deleteArchiveItem(name) {
            if(confirm(`حذف التقرير المؤرشف لـ "${name}"؟`)) {
                await fetch(`${sheetDBUrl}/lectureName/${encodeURIComponent(name)}?sheet=Archive`, { method: 'DELETE' }).catch(()=>{});
                loadArchiveReports();
            }
        }

        async function downloadArchive() {
            try {
                const res = await fetch(`${sheetDBUrl}?sheet=Archive`, { cache: "no-store" });
                const data = await res.json();
                if(!Array.isArray(data) || data.length === 0) { alert("لا توجد تقارير مؤرشفة لتحميلها."); return; }
                let csv = "LectureName,Date,TotalStudents,Details\n";
                data.forEach(r => csv += `"${r.lectureName || ''}","${r.date || ''}","${r.totalStudents || 0}","${(r.details || '').replace(/"/g, '""')}"\n`);
                const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'Archive_Reports.csv';
                a.click();
            } catch(e) { alert("حدث خطأ أثناء تحميل الأرشيف."); }
        }

        async function clearArchive() {
            if(confirm("⚠️ مسح الأرشيف بالكامل نهائياً؟")) {
                try {
                    const res = await fetch(`${sheetDBUrl}?sheet=Archive`, { cache: "no-store" });
                    const data = await res.json();
                    if(Array.isArray(data)) {
                        for(let r of data) {
                            if(r.lectureName) await fetch(`${sheetDBUrl}/lectureName/${encodeURIComponent(r.lectureName)}?sheet=Archive`, { method: 'DELETE' }).catch(()=>{});
                        }
                    }
                    alert("🗑️ تم تفريغ الأرشيف بالكامل!");
                    loadArchiveReports();
                } catch(e) {}
            }
        }

        async function loadStudentsList() {
            const container = document.getElementById('studentsTableContainer');
            container.innerHTML = "جاري التحميل...";
            try {
                const students = await fetchAllStudentsFromSheet();
                if(!students || students.length === 0) {
                    container.innerHTML = "<p style='color:var(--text-sub);'>لا توجد بيانات طلاب مسجلة.</p>";
                    return;
                }
                let html = `<table style="width:100%; border-collapse:collapse; font-size:12px;"><tr style="background:rgba(255,255,255,0.05); text-align:right;"><th>ID</th><th>الاسم</th><th>الهاتف</th><th>السر</th><th>الحضور</th><th>تعديل/حذف</th></tr>`;
                students.forEach(st => {
                    if(st.id) {
                        html += `<tr style="border-bottom:1px solid var(--border-color);">
                            <td>${st.id}</td>
                            <td>${st.name}</td>
                            <td>${st.phone}</td>
                            <td>${st.password || '-'}</td>
                            <td style="color:var(--accent-green); font-weight:bold;">${st.attendanceCount || 0} مرة</td>
                            <td>
                                <button onclick="editStudentData('${st.id}', '${st.name}', '${st.phone}', '${st.password || ''}', '${st.attendanceCount || 0}')" style="background:#38bdf8; color:#fff; border:none; padding:3px 6px; border-radius:4px; margin-left:2px;">✏️</button>
                                <button onclick="deleteStudentRow('${st.id}')" style="background:var(--accent-red); color:#fff; border:none; padding:3px 6px; border-radius:4px;">🗑️</button>
                            </td>
                        </tr>`;
                    }
                });
                html += `</table>`;
                container.innerHTML = html;
            } catch(e) {
                container.innerHTML = "<p style='color:var(--text-sub);'>لا توجد بيانات طلاب مسجلة.</p>";
            }
        }

        async function editStudentData(id, currentName, currentPhone, currentPass, currentAttendance) {
            const newName = prompt("✏️ تعديل اسم الطالب:", currentName);
            if(newName === null) return;
            const newPhone = prompt("📞 تعديل رقم الهاتف:", currentPhone);
            if(newPhone === null) return;
            const newPass = prompt("🔑 تعديل كلمة السر:", currentPass);
            if(newPass === null) return;
            const newAttendance = prompt("📊 تعديل عدد مرات الحضور:", currentAttendance);
            if(newAttendance === null) return;

            const updatedData = {
                id: id,
                name: newName,
                phone: newPhone,
                password: newPass,
                attendanceCount: newAttendance
            };

            // تحديث الشيت
            try {
                await fetch(`${sheetDBUrl}/id/${id}?sheet=students`, {
                    method: 'PATCH',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: updatedData })
                });
                alert("✅ تم تعديل بيانات الطالب بنجاح في الشيت!");
                loadStudentsList();
            } catch(e) { alert("حدث خطأ أثناء تعديل بيانات الطالب."); }
        }

        async function deleteStudentRow(id) {
            if(confirm(`حذف الطالب ذو الـ ID (${id}) نهائياً؟`)) {
                await fetch(`${sheetDBUrl}/id/${id}?sheet=students`, { method: 'DELETE' }).catch(()=>{});
                loadStudentsList();
            }
        }
    </script>
</body>
</html>
