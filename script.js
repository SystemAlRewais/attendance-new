// تحديث إعداد معين في الشيت سحابياً بطريقة مضمونة
async function updateAppSetting(keyName, keyValue) {
    try {
        // تخزين محلي فوري لتشعر بالسرعة الفورية
        let cached = JSON.parse(localStorage.getItem('cachedSettings')) || {};
        cached[keyName] = String(keyValue);
        localStorage.setItem('cachedSettings', JSON.stringify(cached));

        // إرسال التحديث لـ SheetDB عن طريق البحث بالـ key وتحديثه
        await fetch(`${sheetDbApiUrl}/key/${keyName}?sheet=Settings`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: { value: String(keyValue) }
            })
        });
        console.log(`Setting ${keyName} updated successfully to ${keyValue}`);
    } catch (error) {
        console.error("Error updating setting:", error);
    }
}
