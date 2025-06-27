package io.catnnect.connect;

import android.os.Build;
import android.os.Bundle;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.util.Log;

import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize Firebase first for FCM
        try {
            FirebaseApp.initializeApp(this);
            Log.i(TAG, "Firebase initialized successfully");
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize Firebase: " + e.getMessage());
        }
        
        // Create notification channel for Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createNotificationChannel();
        }
    }
    
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                String channelId = getString(R.string.default_notification_channel_id);
                String channelName = "App Notifications";
                int importance = NotificationManager.IMPORTANCE_HIGH;
                
                NotificationChannel channel = new NotificationChannel(channelId, channelName, importance);
                channel.setDescription("Notifications from Catnnect Connect");
                channel.enableLights(true);
                channel.enableVibration(true);
                
                notificationManager.createNotificationChannel(channel);
                Log.i(TAG, "Notification channel created: " + channelId);
            } catch (Exception e) {
                Log.e(TAG, "Failed to create notification channel: " + e.getMessage());
            }
        }
    }
}
