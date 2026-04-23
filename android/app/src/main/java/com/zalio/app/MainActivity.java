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

        // Força o WebView a respeitar a área da barra de status (hora, bateria, etc)
        View webView = getBridge().getWebView();
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (v, insets) -> {
            int top = insets.getInsets(WindowInsetsCompat.Type.systemBars()).top;
            
            // Adiciona um distanciamento no topo igual ao tamanho da barra de status
            v.setPadding(0, top, 0, 0);
            
            return insets;
        });
    }
}
