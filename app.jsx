/* TraceOn landing — top-level app */

const { useState, useEffect } = React;

function App() {
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  return (
    <div className="min-h-screen">
      <Nav theme={theme} setTheme={setTheme} />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <Honesty />
        <GetStarted />
        <Limits />
      </main>
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
