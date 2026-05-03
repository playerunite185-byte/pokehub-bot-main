export interface TimezoneEntry {
  country: string;
  timezone: string;
  flag: string;
}

export const TIMEZONES: TimezoneEntry[] = [
  { country: "Afghanistan", timezone: "Asia/Kabul", flag: "🇦🇫" },
  { country: "Albania", timezone: "Europe/Tirane", flag: "🇦🇱" },
  { country: "Algeria", timezone: "Africa/Algiers", flag: "🇩🇿" },
  { country: "Argentina", timezone: "America/Argentina/Buenos_Aires", flag: "🇦🇷" },
  { country: "Armenia", timezone: "Asia/Yerevan", flag: "🇦🇲" },
  { country: "Australia (Sydney)", timezone: "Australia/Sydney", flag: "🇦🇺" },
  { country: "Australia (Melbourne)", timezone: "Australia/Melbourne", flag: "🇦🇺" },
  { country: "Australia (Perth)", timezone: "Australia/Perth", flag: "🇦🇺" },
  { country: "Australia (Brisbane)", timezone: "Australia/Brisbane", flag: "🇦🇺" },
  { country: "Austria", timezone: "Europe/Vienna", flag: "🇦🇹" },
  { country: "Azerbaijan", timezone: "Asia/Baku", flag: "🇦🇿" },
  { country: "Bahrain", timezone: "Asia/Bahrain", flag: "🇧🇭" },
  { country: "Bangladesh", timezone: "Asia/Dhaka", flag: "🇧🇩" },
  { country: "Belarus", timezone: "Europe/Minsk", flag: "🇧🇾" },
  { country: "Belgium", timezone: "Europe/Brussels", flag: "🇧🇪" },
  { country: "Bolivia", timezone: "America/La_Paz", flag: "🇧🇴" },
  { country: "Bosnia", timezone: "Europe/Sarajevo", flag: "🇧🇦" },
  { country: "Brazil (Brasilia)", timezone: "America/Sao_Paulo", flag: "🇧🇷" },
  { country: "Brazil (Manaus)", timezone: "America/Manaus", flag: "🇧🇷" },
  { country: "Bulgaria", timezone: "Europe/Sofia", flag: "🇧🇬" },
  { country: "Cambodia", timezone: "Asia/Phnom_Penh", flag: "🇰🇭" },
  { country: "Canada (Toronto)", timezone: "America/Toronto", flag: "🇨🇦" },
  { country: "Canada (Vancouver)", timezone: "America/Vancouver", flag: "🇨🇦" },
  { country: "Canada (Calgary)", timezone: "America/Edmonton", flag: "🇨🇦" },
  { country: "Chile", timezone: "America/Santiago", flag: "🇨🇱" },
  { country: "China", timezone: "Asia/Shanghai", flag: "🇨🇳" },
  { country: "Colombia", timezone: "America/Bogota", flag: "🇨🇴" },
  { country: "Croatia", timezone: "Europe/Zagreb", flag: "🇭🇷" },
  { country: "Cuba", timezone: "America/Havana", flag: "🇨🇺" },
  { country: "Czech Republic", timezone: "Europe/Prague", flag: "🇨🇿" },
  { country: "Denmark", timezone: "Europe/Copenhagen", flag: "🇩🇰" },
  { country: "Dominican Republic", timezone: "America/Santo_Domingo", flag: "🇩🇴" },
  { country: "Ecuador", timezone: "America/Guayaquil", flag: "🇪🇨" },
  { country: "Egypt", timezone: "Africa/Cairo", flag: "🇪🇬" },
  { country: "Estonia", timezone: "Europe/Tallinn", flag: "🇪🇪" },
  { country: "Ethiopia", timezone: "Africa/Addis_Ababa", flag: "🇪🇹" },
  { country: "Finland", timezone: "Europe/Helsinki", flag: "🇫🇮" },
  { country: "France", timezone: "Europe/Paris", flag: "🇫🇷" },
  { country: "Georgia", timezone: "Asia/Tbilisi", flag: "🇬🇪" },
  { country: "Germany", timezone: "Europe/Berlin", flag: "🇩🇪" },
  { country: "Ghana", timezone: "Africa/Accra", flag: "🇬🇭" },
  { country: "Greece", timezone: "Europe/Athens", flag: "🇬🇷" },
  { country: "Guatemala", timezone: "America/Guatemala", flag: "🇬🇹" },
  { country: "Hong Kong", timezone: "Asia/Hong_Kong", flag: "🇭🇰" },
  { country: "Hungary", timezone: "Europe/Budapest", flag: "🇭🇺" },
  { country: "Iceland", timezone: "Atlantic/Reykjavik", flag: "🇮🇸" },
  { country: "India", timezone: "Asia/Kolkata", flag: "🇮🇳" },
  { country: "Indonesia (Jakarta)", timezone: "Asia/Jakarta", flag: "🇮🇩" },
  { country: "Iran", timezone: "Asia/Tehran", flag: "🇮🇷" },
  { country: "Iraq", timezone: "Asia/Baghdad", flag: "🇮🇶" },
  { country: "Ireland", timezone: "Europe/Dublin", flag: "🇮🇪" },
  { country: "Israel", timezone: "Asia/Jerusalem", flag: "🇮🇱" },
  { country: "Italy", timezone: "Europe/Rome", flag: "🇮🇹" },
  { country: "Jamaica", timezone: "America/Jamaica", flag: "🇯🇲" },
  { country: "Japan", timezone: "Asia/Tokyo", flag: "🇯🇵" },
  { country: "Jordan", timezone: "Asia/Amman", flag: "🇯🇴" },
  { country: "Kazakhstan", timezone: "Asia/Almaty", flag: "🇰🇿" },
  { country: "Kenya", timezone: "Africa/Nairobi", flag: "🇰🇪" },
  { country: "Kuwait", timezone: "Asia/Kuwait", flag: "🇰🇼" },
  { country: "Kyrgyzstan", timezone: "Asia/Bishkek", flag: "🇰🇬" },
  { country: "Latvia", timezone: "Europe/Riga", flag: "🇱🇻" },
  { country: "Lebanon", timezone: "Asia/Beirut", flag: "🇱🇧" },
  { country: "Libya", timezone: "Africa/Tripoli", flag: "🇱🇾" },
  { country: "Lithuania", timezone: "Europe/Vilnius", flag: "🇱🇹" },
  { country: "Luxembourg", timezone: "Europe/Luxembourg", flag: "🇱🇺" },
  { country: "Malaysia", timezone: "Asia/Kuala_Lumpur", flag: "🇲🇾" },
  { country: "Maldives", timezone: "Indian/Maldives", flag: "🇲🇻" },
  { country: "Malta", timezone: "Europe/Malta", flag: "🇲🇹" },
  { country: "Mexico (Mexico City)", timezone: "America/Mexico_City", flag: "🇲🇽" },
  { country: "Moldova", timezone: "Europe/Chisinau", flag: "🇲🇩" },
  { country: "Mongolia", timezone: "Asia/Ulaanbaatar", flag: "🇲🇳" },
  { country: "Morocco", timezone: "Africa/Casablanca", flag: "🇲🇦" },
  { country: "Myanmar", timezone: "Asia/Rangoon", flag: "🇲🇲" },
  { country: "Nepal", timezone: "Asia/Kathmandu", flag: "🇳🇵" },
  { country: "Netherlands", timezone: "Europe/Amsterdam", flag: "🇳🇱" },
  { country: "New Zealand", timezone: "Pacific/Auckland", flag: "🇳🇿" },
  { country: "Nigeria", timezone: "Africa/Lagos", flag: "🇳🇬" },
  { country: "North Korea", timezone: "Asia/Pyongyang", flag: "🇰🇵" },
  { country: "Norway", timezone: "Europe/Oslo", flag: "🇳🇴" },
  { country: "Oman", timezone: "Asia/Muscat", flag: "🇴🇲" },
  { country: "Pakistan", timezone: "Asia/Karachi", flag: "🇵🇰" },
  { country: "Palestine", timezone: "Asia/Gaza", flag: "🇵🇸" },
  { country: "Panama", timezone: "America/Panama", flag: "🇵🇦" },
  { country: "Paraguay", timezone: "America/Asuncion", flag: "🇵🇾" },
  { country: "Peru", timezone: "America/Lima", flag: "🇵🇪" },
  { country: "Philippines", timezone: "Asia/Manila", flag: "🇵🇭" },
  { country: "Poland", timezone: "Europe/Warsaw", flag: "🇵🇱" },
  { country: "Portugal", timezone: "Europe/Lisbon", flag: "🇵🇹" },
  { country: "Qatar", timezone: "Asia/Qatar", flag: "🇶🇦" },
  { country: "Romania", timezone: "Europe/Bucharest", flag: "🇷🇴" },
  { country: "Russia (Moscow)", timezone: "Europe/Moscow", flag: "🇷🇺" },
  { country: "Russia (Vladivostok)", timezone: "Asia/Vladivostok", flag: "🇷🇺" },
  { country: "Russia (Novosibirsk)", timezone: "Asia/Novosibirsk", flag: "🇷🇺" },
  { country: "Saudi Arabia", timezone: "Asia/Riyadh", flag: "🇸🇦" },
  { country: "Serbia", timezone: "Europe/Belgrade", flag: "🇷🇸" },
  { country: "Singapore", timezone: "Asia/Singapore", flag: "🇸🇬" },
  { country: "Slovakia", timezone: "Europe/Bratislava", flag: "🇸🇰" },
  { country: "Slovenia", timezone: "Europe/Ljubljana", flag: "🇸🇮" },
  { country: "South Africa", timezone: "Africa/Johannesburg", flag: "🇿🇦" },
  { country: "South Korea", timezone: "Asia/Seoul", flag: "🇰🇷" },
  { country: "Spain", timezone: "Europe/Madrid", flag: "🇪🇸" },
  { country: "Sri Lanka", timezone: "Asia/Colombo", flag: "🇱🇰" },
  { country: "Sudan", timezone: "Africa/Khartoum", flag: "🇸🇩" },
  { country: "Sweden", timezone: "Europe/Stockholm", flag: "🇸🇪" },
  { country: "Switzerland", timezone: "Europe/Zurich", flag: "🇨🇭" },
  { country: "Syria", timezone: "Asia/Damascus", flag: "🇸🇾" },
  { country: "Taiwan", timezone: "Asia/Taipei", flag: "🇹🇼" },
  { country: "Tajikistan", timezone: "Asia/Dushanbe", flag: "🇹🇯" },
  { country: "Tanzania", timezone: "Africa/Dar_es_Salaam", flag: "🇹🇿" },
  { country: "Thailand", timezone: "Asia/Bangkok", flag: "🇹🇭" },
  { country: "Tunisia", timezone: "Africa/Tunis", flag: "🇹🇳" },
  { country: "Turkey", timezone: "Europe/Istanbul", flag: "🇹🇷" },
  { country: "Turkmenistan", timezone: "Asia/Ashgabat", flag: "🇹🇲" },
  { country: "UAE", timezone: "Asia/Dubai", flag: "🇦🇪" },
  { country: "Uganda", timezone: "Africa/Kampala", flag: "🇺🇬" },
  { country: "UK", timezone: "Europe/London", flag: "🇬🇧" },
  { country: "Ukraine", timezone: "Europe/Kiev", flag: "🇺🇦" },
  { country: "Uruguay", timezone: "America/Montevideo", flag: "🇺🇾" },
  { country: "USA (New York)", timezone: "America/New_York", flag: "🇺🇸" },
  { country: "USA (Chicago)", timezone: "America/Chicago", flag: "🇺🇸" },
  { country: "USA (Denver)", timezone: "America/Denver", flag: "🇺🇸" },
  { country: "USA (Los Angeles)", timezone: "America/Los_Angeles", flag: "🇺🇸" },
  { country: "USA (Phoenix)", timezone: "America/Phoenix", flag: "🇺🇸" },
  { country: "USA (Honolulu)", timezone: "Pacific/Honolulu", flag: "🇺🇸" },
  { country: "USA (Anchorage)", timezone: "America/Anchorage", flag: "🇺🇸" },
  { country: "Uzbekistan", timezone: "Asia/Tashkent", flag: "🇺🇿" },
  { country: "Venezuela", timezone: "America/Caracas", flag: "🇻🇪" },
  { country: "Vietnam", timezone: "Asia/Ho_Chi_Minh", flag: "🇻🇳" },
  { country: "Yemen", timezone: "Asia/Aden", flag: "🇾🇪" },
  { country: "Zambia", timezone: "Africa/Lusaka", flag: "🇿🇲" },
  { country: "Zimbabwe", timezone: "Africa/Harare", flag: "🇿🇼" },
];

export function searchTimezones(query: string): TimezoneEntry[] {
  if (!query) return TIMEZONES.slice(0, 25);
  const q = query.toLowerCase();
  return TIMEZONES.filter(
    (t) => t.country.toLowerCase().includes(q) || t.timezone.toLowerCase().includes(q)
  ).slice(0, 25);
}

export function getTimeFor(timezone: string): string | null {
  try {
    const now = new Date();
    const formatted = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(now);
    return formatted;
  } catch {
    return null;
  }
}

export function getUtcOffset(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}
