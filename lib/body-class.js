export function bodyClassForPath(pathname = "") {
  if (pathname === "/auth/welcome" || pathname === "/auth/portal") {
    return "has-emergency-rail";
  }
  if (
    pathname === "/dashboard" ||
    pathname === "/dashboard/medications" ||
    pathname === "/dashboard/appointments" ||
    pathname === "/dashboard/vaccines"
  ) {
    return "has-emergency-rail dashboard-home-body";
  }
  if (pathname === "/readonly/profile") {
    return "has-emergency-rail dashboard-home-body readonly-dashboard-body";
  }
  if (pathname === "/dashboard/profile") {
    return "medical-profile-body";
  }
  if (pathname === "/dashboard/sos" || pathname === "/readonly/sos") {
    return "sos-body";
  }
  if (pathname === "/dashboard/emergency-info" || pathname === "/readonly/emergency-info") {
    return "emergency-info-page-body";
  }
  return "";
}
