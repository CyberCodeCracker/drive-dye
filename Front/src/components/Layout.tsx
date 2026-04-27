import Header from "./Header";
import Footer from "./Footer";
import ScrollToTopButton from "./ScrollToTop";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
    <ScrollToTopButton />
  </div>
);

export default Layout;
