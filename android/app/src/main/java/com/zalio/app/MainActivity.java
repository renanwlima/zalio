package com.zalio.app;

import android.os.Bundle;
import android.view.View;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Força o WebView a respeitar as áreas do sistema (Status Bar e Navigation Bar)
        View contentView = findViewById(android.R.id.content);
        ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, insets) -> {
            androidx.core.graphics.Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            
            // Aplica o padding no topo (barra de status) e na base (barra de navegação)
            v.setPadding(0, systemBars.top, 0, systemBars.bottom);
            
            return insets;
        });
    }
}
