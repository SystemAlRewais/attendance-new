const sheetDBUrl = "https://sheetdb.io/api/v1/851i0cwulmnso";

function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('my_unique_device_id');
    if (!deviceId) {
        deviceId = 'DEV-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('my_unique_device_id', deviceId);
    }
    return deviceId;
}

function generateStudentID() {
    return 'AZ' + Math.floor(100000 + Math.random() * 900000);
}

// جلب الإعدادات من صفحة Setting
async function fetchAppSettings() {
    try {
        const response = await fetch(`${sheetDBUrl}?sheet=Setting`, { cache: "no-store" });
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            const settingRow = data.find(row => row.isAttendanceOpen !== undefined || row.currentSubject !== undefined);
            if (settingRow) return settingRow;
            return data[0];
        }
        return { isAttendanceOpen: 'true', currentSubject: 'المحاضرة الأولى' };
    } catch (error) {
        return { isAttendanceOpen: 'true', currentSubject: 'المحاضرة الأولى' };
    }
}

// جلب الطلاب من صفحة students
async function fetchAllStudentsFromSheet() {
    try {
        const response = await fetch(`${sheetDBUrl}?sheet=students`, { cache: "no-store" });
        const data = await response.json();
        if (Array.isArray(data)) {
            return data.filter(row => row.id && row.id.toString().startsWith('AZ'));
        }
        return [];
    } catch (error) {
        return [];
    }
}

async function createAccount() {
    const statusEl = document.getElementById('authStatus');
    if(statusEl) {
        statusEl.style.color = "#38bdf8";
        statusEl.textContent = "⏳ جاري إنشاء الحساب وإرساله للشيت...";
    }

    const name = document.getElementById('fullname')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const grade = document.getElementById('grade')?.value;
    const password = document.getElementById('password')?.value.trim();

    if (!name || !phone || !grade || !password) {
        alert("⚠️ يرجى إكمال جميع الحقول المطلوبة!");
        if(statusEl) statusEl.textContent = "";
        return;
    }

    let deviceId = getOrCreateDeviceId();
    const newId = generateStudentID();
    const userData = {
        id: newId,
        name: name,
        phone: phone,
        grade: grade,
        password: password,
        boundDeviceId: deviceId
    };

    localStorage.setItem(newId, JSON.stringify(userData));
    localStorage.setItem('currentUser', JSON.stringify(userData));

    try {
        await fetch(`${sheetDBUrl}?sheet=students`, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [userData] })
        });
    } catch (e) {}

    alert(`🎉 تم إنشاء حسابك بنجاح!\n\n🆔 الرقم الجامعي: ${newId}\n🔑 كلمة السر: ${password}`);
    window.location.href = 'subjects.html';
}

async function login() {
    const id = document.getElementById('loginId')?.value.trim();
    const pass = document.getElementById('loginPassword')?.value.trim();

    if (!id || !pass) {
        alert("يرجى كتابة الرقم الجامعي وكلمة السر!");
        return;
    }

    let savedUserStr = localStorage.getItem(id);
    
    // إذا لم يكن الحساب مسجلاً على هذا الجهاز محلياً (أو في حال الأجهزة المتعددة)
    if (!savedUserStr) {
        const adminOverride = prompt("⚠️ هذا الحساب غير مسجل على هذا الجهاز (أو مسجل على جهاز آخر).\nللمساعدة وتجاوز القيد وفتح الحساب، أدخل كود المشرف السري (Emoo):");
        
        if (adminOverride !== "Emoo") {
            alert("❌ الكود السري غير صحيح. لا يمكن فتح الحساب من جهاز مختلف.");
            return;
        }
        
        alert("🔓 تم تجاوز قيد الجهاز بواسطة المشرف بنجاح!");
        
        // جلب بيانات الطالب من الشيت أو إنشاء كائن مؤقت للدخول المباشر
        let targetStudent = null;
        try {
            const students = await fetchAllStudentsFromSheet();
            targetStudent = students.find(s => String(s.id).trim() === id);
        } catch(e) {}

        const userObj = targetStudent || { id: id, name: "طالب معتمد (استثناء جهاز)", phone: "-", grade: "-", password: pass };
        localStorage.setItem('currentUser', JSON.stringify(userObj));
        window.location.href = 'subjects.html';
        return;
    }

    const user = JSON.parse(savedUserStr);
    if (user.password !== pass) {
        alert("❌ كلمة السر غير صحيحة!");
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'subjects.html';
}
