// Text style presets. Spread these into a <Text style={[...]}> along with a
// color from the active theme, e.g. style={[typography.screenTitle, { color: colors.textPrimary }]}
export const typography = {
  screenTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4, lineHeight: 32 },
  sectionTitle: { fontSize: 19, fontWeight: '700', letterSpacing: -0.2, lineHeight: 24 },
  cardTitle: { fontSize: 16, fontWeight: '700', lineHeight: 21 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodyStrong: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
  label: { fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
  button: { fontSize: 15, fontWeight: '700' },
};

export default typography;
