const sheetDbApiUrl = "https://sheetdb.io/api/v1/a89ry8w0gkj0g";

// جلب الإعدادات من الشيت
async function fetchAppSettings() {
    try {
        const response = await fetch(sheetDbApiUrl + "?sheet=Settings");
        const settings = await response.json();
        
        let settingsObj = {
            isAttendanceOpen: 'true',
            isRegistrationOpen: 'true',
            currentSubject: 'المحاضرة الأولى'
        };
        
        if (Array.isArray(settings)) {
            settings.forEach(row => {
                if (row.key && row.value !== undefined) {
                    let key = String(row.key).trim();
                    let val = String(row.value).trim().toLowerCase();
                    if (val === 'true' || val === '1' || val === 'yes' || row.value === true) {
                        settingsObj[key] = 'true';
                    } else if (val === 'false' || val === '0' || val === 'no' || row.value === false) {
                        settingsObj[key] = 'false';
                    } else {
                        settingsObj[key] = String(row.value).trim();
                    }
                }
            });
        }
        return settingsObj;
    } catch (error) {
        console.error("Error fetching settings:", error);
        return { isAttendanceOpen: 'true', isRegistrationOpen: 'true', currentSubject: 'المحاضرة الأولى' };
    }
}

// تحديث الإعدادات في SheetDB بالطريقة السليمة لعمود key
async function updateAppSetting(keyName, keyValue) {
    try {
        const response = await fetch(`${sheetDbApiUrl}/key/key/${keyName}?sheet=Settings`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: { key: keyName, value: String(keyValue) }
            })
        });
        const result = await response.json();
        console.log("Update result:", result);
    } catch (error) {
        console.error("Error updating setting:", error);
    }
}
