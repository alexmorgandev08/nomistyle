<?php

namespace GutenStyle\Views;

if (!defined('ABSPATH')) {
    exit;
}

class Body
{
    public function render()
    {
        echo '<div id="nomistyle-root" class="wrap"><p>'
            . esc_html__('Loading Nomi Style… If this message stays, the plugin assets are missing: run `pnpm build` in the plugin folder.', 'nomistyle')
            . '</p></div>';
    }
}
