import drCrispyIcon from "../assets/icono.jpg";

function AppLoader() {
  return (
    <div style={styles.loaderPage}>
      <div style={styles.glowOne}></div>
      <div style={styles.glowTwo}></div>

      <div style={styles.loaderCard}>
        <div style={styles.iconWrap}>
          <img src={drCrispyIcon} alt="Dr. Crispy" style={styles.icon} />
        </div>

        <h1 style={styles.title}>Dr. Crispy Lab</h1>
        <p style={styles.subtitle}>Activando laboratorio del sabor...</p>

        <div style={styles.progressTrack}>
          <div style={styles.progressBar}></div>
        </div>

        <p style={styles.footer}>Preparando fórmulas crispy</p>
      </div>
    </div>
  );
}

const styles = {
  loaderPage: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top right, rgba(255,0,0,0.18), transparent 20%), radial-gradient(circle at bottom left, rgba(255,80,80,0.10), transparent 20%), linear-gradient(135deg, #040404 0%, #0b0b0b 40%, #160606 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
    padding: 24,
  },
  glowOne: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: "50%",
    background: "rgba(255, 0, 0, 0.12)",
    filter: "blur(50px)",
    top: "8%",
    right: "10%",
  },
  glowTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "rgba(255, 60, 60, 0.10)",
    filter: "blur(60px)",
    bottom: "10%",
    left: "8%",
  },
  loaderCard: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(14,14,14,0.95)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 28,
    padding: "32px 26px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    position: "relative",
    zIndex: 2,
  },
  iconWrap: {
    width: 110,
    height: 110,
    margin: "0 auto 18px auto",
    borderRadius: "50%",
    overflow: "hidden",
    border: "4px solid #ff1a1a",
    boxShadow: "0 0 24px rgba(255,0,0,0.28)",
    background: "#111",
  },
  icon: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  title: {
    margin: 0,
    color: "#ff2a2a",
    fontSize: 36,
    fontWeight: "bold",
    textShadow: "0 0 16px rgba(255,0,0,0.18)",
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 24,
    color: "#d7d7d7",
    fontSize: 16,
  },
  progressTrack: {
    width: "100%",
    height: 14,
    borderRadius: 999,
    background: "#1d1d1d",
    border: "1px solid #2f2f2f",
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    width: "70%",
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #ff0000, #ff5a5a)",
    animation: "loaderMove 1.3s ease-in-out infinite alternate",
  },
  footer: {
    marginTop: 18,
    marginBottom: 0,
    color: "#9a9a9a",
    fontSize: 14,
    letterSpacing: 0.4,
  },
};

export default AppLoader;