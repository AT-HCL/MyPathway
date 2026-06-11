export const CA_COUNTIES = [
  "Alameda", "Alpine", "Amador", "Butte", "Calaveras", "Colusa", "Contra Costa",
  "Del Norte", "El Dorado", "Fresno", "Glenn", "Humboldt", "Imperial", "Inyo",
  "Kern", "Kings", "Lake", "Lassen", "Los Angeles", "Madera", "Marin",
  "Mariposa", "Mendocino", "Merced", "Modoc", "Mono", "Monterey", "Napa",
  "Nevada", "Orange", "Placer", "Plumas", "Riverside", "Sacramento",
  "San Benito", "San Bernardino", "San Diego", "San Francisco", "San Joaquin",
  "San Luis Obispo", "San Mateo", "Santa Barbara", "Santa Clara", "Santa Cruz",
  "Shasta", "Sierra", "Siskiyou", "Solano", "Sonoma", "Stanislaus", "Sutter",
  "Tehama", "Trinity", "Tulare", "Tuolumne", "Ventura", "Yolo", "Yuba",
];

// Seven-county implementation pilot
export const PILOT_COUNTIES = [
  "Alameda", "Humboldt", "Los Angeles", "Mariposa", "Riverside", "Sacramento", "San Diego",
];

// County-tailored resources shown on the dashboard. Pilot counties get
// specific entries; everyone gets the statewide set.
export const COUNTY_RESOURCES = {
  statewide: [
    { name: "CalJOBS", url: "https://www.caljobs.ca.gov", descKey: "resources.caljobs" },
    { name: "America's Job Center of California (AJCC)", url: "https://edd.ca.gov/en/jobs_and_training/office_locator/", descKey: "resources.ajcc" },
    { name: "VolunteerMatch", url: "https://www.volunteermatch.org", descKey: "resources.volunteermatch" },
    { name: "California Volunteers", url: "https://www.californiavolunteers.ca.gov", descKey: "resources.cavolunteers" },
    { name: "California Community Colleges", url: "https://www.cccco.edu", descKey: "resources.ccc" },
    { name: "California Adult Education", url: "https://caladulted.org", descKey: "resources.adultEd" },
    { name: "CalFresh Employment & Training (E&T)", url: "https://www.cdss.ca.gov/inforesources/calfresh-employment-and-training", descKey: "resources.cfet" },
    { name: "Job Corps (ages 16-24)", url: "https://www.jobcorps.gov", descKey: "resources.jobcorps" },
  ],
  Alameda: [
    { name: "Alameda County Workforce Development Board", url: "https://www.acwdb.org", descKey: "resources.countyWdb" },
    { name: "Alameda County Social Services", url: "https://www.alamedacountysocialservices.org", descKey: "resources.countySocial" },
  ],
  Humboldt: [
    { name: "Humboldt County DHHS", url: "https://humboldtgov.org/2014/DHHS", descKey: "resources.countySocial" },
    { name: "Job Market of Humboldt County", url: "https://humboldtgov.org/356/Employment-Training", descKey: "resources.countyWdb" },
  ],
  "Los Angeles": [
    { name: "LA County DPSS", url: "https://dpss.lacounty.gov", descKey: "resources.countySocial" },
    { name: "America's Job Centers of California — LA County", url: "https://workforce.lacounty.gov", descKey: "resources.countyWdb" },
  ],
  Mariposa: [
    { name: "Mariposa County Human Services", url: "https://www.mariposacounty.org/86/Human-Services", descKey: "resources.countySocial" },
    { name: "Mother Lode Job Training", url: "https://www.mljt.org", descKey: "resources.countyWdb" },
  ],
  Riverside: [
    { name: "Riverside County DPSS", url: "https://dpss.co.riverside.ca.us", descKey: "resources.countySocial" },
    { name: "Riverside County Workforce Development", url: "https://rivcoworkforce.com", descKey: "resources.countyWdb" },
  ],
  Sacramento: [
    { name: "Sacramento County DHA", url: "https://dha.saccounty.gov", descKey: "resources.countySocial" },
    { name: "Sacramento Employment & Training Agency (SETA)", url: "https://www.seta.net", descKey: "resources.countyWdb" },
  ],
  "San Diego": [
    { name: "San Diego County HHSA", url: "https://www.sandiegocounty.gov/hhsa/", descKey: "resources.countySocial" },
    { name: "San Diego Workforce Partnership", url: "https://workforce.org", descKey: "resources.countyWdb" },
  ],
};

export function resourcesForCounty(county) {
  const local = COUNTY_RESOURCES[county] || [];
  return { local, statewide: COUNTY_RESOURCES.statewide };
}
