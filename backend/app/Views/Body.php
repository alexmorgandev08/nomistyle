<?php

namespace GutenStyle\Views;

if (!defined('ABSPATH')) {
    exit;
}

class Body
{
    public function render()
    {
        echo '<div id="guten-style-root" class="wrap"><p>'
            . esc_html__('Loading GutenStyle… If this message stays, the plugin assets are missing: run `pnpm build` in the plugin folder.', 'guten-style')
            . '</p></div>';
    }
}
