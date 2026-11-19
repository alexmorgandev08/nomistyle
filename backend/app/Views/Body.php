<?php

namespace GutenStyle\Views;

if (!defined('ABSPATH')) {
    exit;
}

class Body
{
    public function render()
    {
        echo '<div id="blockstyle-root" class="wrap"><p>'
            . esc_html__('Loading Block Style… If this message stays, the plugin assets are missing: run `pnpm build` in the plugin folder.', 'blockstyle')
            . '</p></div>';
    }
}
