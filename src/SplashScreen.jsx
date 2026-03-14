import drCrispyIcon from "./assets/icono.jpg";

function SplashScreen() {
  return (
    <div style={styles.page}>
      <div style={styles.glowOne}></div>
      <div style={styles.glowTwo}></div>

      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <img src={drCrispyIcon} alt="Dr. Crispy" style={styles.logo} />
        </div>

        <h1 style={styles.title}>Dr. Crispy Lab</h1>
        <p style={styles.subtitle}>Laboratorio del sabor</p>

        <div style={styles.loaderWrap}>
          <div style={styles.loaderBar}>
            <div style={styles.loaderFill}></div>
          </div>
          <p style={styles.loadingText}>Iniciando experimentos...</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top right, rgba(255,0,0,0.22), transparent 20%), radial-gradient(circle at bottom left, rgba(255,80,80,0.14), transparent 20%), linear-gradient(135deg, #030303 0%, #090909 40%, #180707 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  glowOne: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: "50%",
    background: "rgba(255,0,0,0.18)",
    filter: "blur(60px)",
    top: -40,
    right: -40,
  },
  glowTwo: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: "50%",
    background: "rgba(255,120,120,0.12)",
    filter: "blur(60px)",
    bottom: -40,
    left: -40,
  },
  card: {
    position: "relative",
    zIndex: 2,
    width: "min(92vw, 460px)",
    background: "rgba(15,15,15,0.92)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 28,
    padding: "36px 28px",
    textAlign: "center",
    boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
  },
  logoWrap: {
    width: 130,
    height: 130,
    margin: "0 auto 18px auto",
    borderRadius: "50%",
    overflow: "hidden",
    border: "4px solid #ff1010",
    boxShadow: "0 0 28px rgba(255,0,0,0.28)",
    animation: "pulse 1.8s infinite ease-in-out",
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  title: {
    margin: 0,
    color: "#ff2b2b",
    fontSize: 40,
    fontWeight: 800,
    textShadow: "0 0 18px rgba(255,0,0,0.20)",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 26,
    color: "#d6d6d6",
    fontSize: 17,
  },
  loaderWrap: {
    marginTop: 10,
  },
  loaderBar: {
    width: "100%",
    height: 12,
    background: "#1d1d1d",
    borderRadius: 999,
    overflow: "hidden",
    border: "1px solid #2e2e2e",
  },
  loaderFill: {
    width: "70%",
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #ff0000, #ff5959)",
    animation: "loadingMove 1.4s infinite ease-in-out",
  },
  loadingText: {
    marginTop: 12,
    color: "#bbbbbb",
    fontSize: 14,
    letterSpacing: 0.5,
  },
};

export default SplashScreen;