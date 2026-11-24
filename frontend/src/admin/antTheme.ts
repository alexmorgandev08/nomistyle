import { theme, type ThemeConfig } from 'antd'

import { type UiTheme } from '../shared/theme'

/**
 * antd tokens that match the Nomi Style design system (tokens in shared/components/style.css).
 * antd derives hover and border shades from these, so they must be plain colors, not var().
 */
const SURFACES: Record<UiTheme, ThemeConfig['token']> = {
  dark: {
    colorBgContainer: '#201e1d',
    colorBgElevated: '#201e1d',
    colorBorder: '#3a3736',
    colorBorderSecondary: '#2e2c2b',
    colorFillTertiary: '#2a2827',
    colorText: '#ecebea',
    colorTextDescription: '#9a9594',
    colorTextSecondary: '#b7b2b1'
  },
  light: {
    colorBgContainer: '#fff',
    colorBgElevated: '#fff',
    colorBorder: '#d7d3d3',
    colorBorderSecondary: '#e3dfdf',
    colorFillTertiary: '#f3f2f2',
    colorText: '#201e1d',
    colorTextDescription: '#605d5d',
    colorTextSecondary: '#444141'
  }
}

export function antTheme(uiTheme: UiTheme): ThemeConfig {
  return {
    algorithm: uiTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    components: {
      Button: { defaultShadow: 'none', primaryShadow: 'none' },
      Card: { headerFontSize: 13 }
    },
    token: {
      ...SURFACES[uiTheme],
      borderRadius: 8,
      colorError: '#cc1818',
      colorPrimary: '#ec3013',
      controlHeight: 30,
      fontFamily: "'GS Archivo', system-ui, sans-serif",
      fontSize: 13
    }
  }
}
