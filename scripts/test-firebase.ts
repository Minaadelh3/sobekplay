
import { getFieldValue } from '../lib/firebaseAdmin';

try {
    console.log("Testing getFieldValue...");
    const FieldValue = getFieldValue();
    console.log("FieldValue type:", typeof FieldValue);
    if (FieldValue) {
        console.log("FieldValue keys:", Object.keys(FieldValue));
        // Check if serverTimestamp is a function
        if (typeof FieldValue.serverTimestamp === 'function') {
            console.log("✅ FieldValue.serverTimestamp is a function");
        } else {
            console.error("❌ FieldValue.serverTimestamp is NOT a function");
        }
    } else {
        console.error("❌ FieldValue is undefined");
    }

} catch (e: any) {
    console.error("❌ Exception:", e);
}
