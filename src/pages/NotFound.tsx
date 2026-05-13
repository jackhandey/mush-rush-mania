import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);

    const prevTitle = document.title;
    document.title = "Page Not Found | MUSH-RUSH Mania";

    const setMeta = (selector: string, attr: string, name: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      const prev = el.getAttribute("content");
      el.setAttribute("content", content);
      return () => {
        if (prev === null) el!.remove();
        else el!.setAttribute("content", prev);
      };
    };

    const restoreDesc = setMeta(
      'meta[name="description"]',
      "name",
      "description",
      "The page you're looking for doesn't exist. Return to MUSH-RUSH Mania to keep playing."
    );
    const restoreOgTitle = setMeta(
      'meta[property="og:title"]',
      "property",
      "og:title",
      "Page Not Found | MUSH-RUSH Mania"
    );
    const restoreOgDesc = setMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
      "The page you're looking for doesn't exist. Return to MUSH-RUSH Mania to keep playing."
    );

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonical = canonical?.getAttribute("href") ?? null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", "https://mush-rush-mania.lovable.app/404");

    return () => {
      document.title = prevTitle;
      restoreDesc();
      restoreOgTitle();
      restoreOgDesc();
      if (prevCanonical !== null) canonical!.setAttribute("href", prevCanonical);
    };
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:opacity-80">
          Return to Home
        </a>
      </div>
    </main>
  );
};

export default NotFound;
