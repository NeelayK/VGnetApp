// lib/api.ts
import axios from "axios";
import { Alert } from "react-native";
import { supabase } from "./supabase";

// Replace with your Raspberry Pi's IP
const PI_BASE_URL = "http://192.168.214.212:5000"; 

export const sendCommand = async (
  device: string,
  action: string,
  visitorName?: string
) => {
  try {
    // Get user profile
    const { data: { user } } = await supabase.auth.getUser();
    let displayName = "Unknown User";

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (profile?.name) displayName = profile.name;
      else if (user.email) displayName = user.email;
    }

    // Send to Pi
    await axios.post(`${PI_BASE_URL}/${device}`, {
      action,
      visitor_name: visitorName || null,
      user_name: displayName
    });

    // Log ONLY main door
    if (device === "main_door" && user) {
      await supabase.from("history").insert({
        user_id: user.id,
        name: visitorName
          ? `${visitorName} (Visitor) - Allowed by ${displayName}`
          : displayName,
        request_name: `Main Door ${action}`
      });
    }

    Alert.alert("✅ Command Sent", `${device} → ${action}`);
  } catch (err) {
    console.error("Error sending command:", err);
    Alert.alert("❌ Error", "Failed to send command to Pi.");
  }
};
