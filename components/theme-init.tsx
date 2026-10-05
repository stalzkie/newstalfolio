/**
 * Applies the visitor's remembered theme before first paint.
 *
 * The root layout pins <html data-theme="light">, so any page outside the
 * desktop shell would otherwise ignore a visitor's choice and render light
 * even after they picked dark. Inline and render-blocking on purpose:
 * running this after hydration would show a flash of the wrong palette.
 */
export function ThemeInit() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html:
          "try{var t=localStorage.getItem('stal-theme');" +
          "if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);" +
          "else if(t==='auto')document.documentElement.removeAttribute('data-theme');}catch(e){}",
      }}
    />
  );
}
