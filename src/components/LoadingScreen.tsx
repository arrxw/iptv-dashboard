export default function LoadingScreen({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" aria-hidden="true" />
      <p className="loading-text">{message}</p>
    </div>
  );
}
