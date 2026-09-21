export default function NikaIcon({ size = 44, style = {} }) {
  return (
    <img
      src="/nika-moon.png"
      alt="Sun God Nika Moon Pose"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        display: 'block',
        boxShadow: '0 0 16px rgba(255, 255, 255, 0.5), 0 0 8px rgba(124, 58, 237, 0.4)',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
