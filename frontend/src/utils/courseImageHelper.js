// Intelligent Course Image Resolver
// Selects highly relevant, subject-specific, professional 16:9 images tailored to course names & degrees

export function getCourseSubjectImage(course) {
  if (!course) return 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80';

  // 1. If custom image was uploaded by admin in CMS, always respect it
  const custom = course.imageUrl || course.catImage || course.image;
  if (custom && typeof custom === 'string' && custom.trim().length > 0) {
    return custom;
  }

  const name = (course.name || '').toLowerCase();
  const cat = (course.category || '').toLowerCase();
  const degree = (course.degree || '').toLowerCase();
  const branch = (course.branch || '').toLowerCase();
  const full = (course.fullName || '').toLowerCase();
  const raw = `${name} ${cat} ${degree} ${branch} ${full}`;

  // Normalized tokens: replace dots, slashes, hyphens, brackets with spaces
  const norm = raw.replace(/[\.\/\-\(\)\&]/g, ' ').replace(/[^a-z0-9]/g, ' ');
  const words = norm.split(/\s+/).filter(Boolean);
  const hasWord = (w) => words.includes(w);
  const hasPhrase = (p) => norm.includes(p);

  // 2. Ph.D. / Research specific matching
  if (hasWord('phd') || hasWord('doctorate') || raw.includes('ph.d')) {
    if (hasWord('education')) {
      return 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'; // Scholars in academic library
    }
    if (hasWord('social') || hasWord('sociology')) {
      return 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80'; // Psychology & human research
    }
    if (hasWord('commerce') || hasWord('management') || hasWord('business')) {
      return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80'; // Corporate executive research
    }
    if (hasWord('computer') || hasWord('engineering')) {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'; // High tech engineering lab
    }
    if (hasWord('law')) {
      return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'; // Legal research gavel
    }
    if (hasWord('science')) {
      return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80'; // Science lab research
    }
    return 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80';
  }

  // 3. Physical Education & Sports
  if (hasWord('bped') || hasWord('mpes') || hasWord('bpes') || hasPhrase('physical education') || hasWord('sports')) {
    return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80'; // Athletic running track & sports coaching
  }

  // 4. Medical Lab Technology (BMLT, DMLT, Pathology)
  if (hasWord('bmlt') || hasWord('dmlt') || hasPhrase('medical lab') || (hasWord('pathology') && !hasWord('plant'))) {
    return 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80'; // Clinical pathology microscope
  }

  // 5. Pharmacy & Medicines
  if (hasWord('pharm') || hasWord('bpharm') || hasWord('dpharm') || hasWord('pharmacy')) {
    return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'; // Pharmacy pills & laboratory
  }

  // 6. Hospital Administration & Healthcare Management
  if (hasWord('hospital') || hasWord('healthcare')) {
    return 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=800&q=80'; // Hospital corridors & medical center
  }

  // 7. Nursing & Clinical Care
  if (hasWord('nurs') || hasWord('gnm') || hasWord('physiotherapy') || hasWord('bpt') || hasWord('bams') || hasWord('ayurved')) {
    return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80'; // Stethoscope & clinical healthcare
  }

  // 8. Agriculture & Agronomy
  if (hasWord('agri') || hasWord('agriculture') || hasWord('agronomy') || hasPhrase('soil science') || hasPhrase('plant pathology') || hasPhrase('agri business')) {
    return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80'; // Lush agriculture field & crop research
  }

  // 9. Banking & Insurance
  if (hasWord('bank') || hasWord('banking') || hasWord('insurance')) {
    return 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?auto=format&fit=crop&w=800&q=80'; // Modern bank vault & financial investment
  }

  // 10. AI, Data Science & Machine Learning
  if (hasPhrase('data science') || hasPhrase('artificial intelligence') || hasWord('aiml') || (hasWord('machine') && hasWord('learning'))) {
    return 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=800&q=80'; // AI neural network code
  }

  // 11. Software Development (BCA, MCA, Computer Science, IT)
  if (hasWord('bca') || hasWord('mca') || hasPhrase('computer science') || hasWord('cse') || (hasWord('it') && (hasWord('mba') || hasWord('btech')))) {
    return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'; // Coding laptop & software engineering
  }

  // 12. Computer Operations & Diplomas (DCA, PGDCA, CPCT, Typing)
  if (hasWord('dca') || hasWord('pgdca') || hasWord('cpct') || hasWord('typing')) {
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'; // Computer keyboard & desk
  }

  // 13. Mining Engineering
  if (hasWord('mining')) {
    return 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80'; // Mining engineering & minerals
  }

  // 14. Civil Engineering & Construction
  if (hasWord('civil') || hasWord('construction')) {
    return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'; // Civil architecture & blueprint
  }

  // 15. Mechanical Engineering
  if (hasWord('mechanical')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'; // Industrial gears & robotics
  }

  // 16. Electrical & Electronics Engineering
  if (hasWord('electrical') || hasWord('eee') || hasWord('electronics') || hasWord('ece')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'; // Circuit electronics
  }

  // 17. Engineering General (B.Tech, M.Tech)
  if (hasWord('btech') || hasWord('mtech') || hasWord('engineering')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
  }

  // 18. Law & Judiciary (LLB, BALLB, LLM)
  if (hasWord('llb') || hasWord('ballb') || hasWord('llm') || hasWord('law')) {
    return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'; // Law courtroom gavel
  }

  // 19. Teaching & Education (B.Ed, D.El.Ed, M.Ed, MA Education)
  if (hasWord('bed') || hasWord('deled') || hasWord('med') || hasPhrase('education') || hasWord('teaching')) {
    return 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80'; // Classroom teacher teaching students
  }

  // 20. Management (MBA, BBA, Entrepreneurship, Retail, NGO)
  if (hasWord('mba') || hasWord('bba') || hasWord('management') || hasWord('entrepreneurship') || hasWord('retail')) {
    return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80'; // Business boardroom
  }

  // 21. Commerce, Accounting & Tally (B.Com, M.Com, Tally, GST)
  if (hasWord('bcom') || hasWord('mcom') || hasWord('commerce') || hasWord('tally') || hasWord('accounting') || hasWord('taxation')) {
    return 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'; // Financial spreadsheets & calculator
  }

  // 22. Economics
  if (hasWord('economics') || hasWord('economic')) {
    return 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80'; // Economic growth analytics
  }

  // 23. Political Science & Governance
  if (hasWord('political')) {
    return 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80'; // Parliament & governance
  }

  // 24. History & Archaeology
  if (hasWord('history')) {
    return 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80'; // Classical historical architecture
  }

  // 25. Sociology & Social Sciences
  if (hasWord('sociology')) {
    return 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80'; // Social research
  }

  // 26. Literature & Languages (Hindi, English)
  if (hasWord('hindi') || hasWord('english') || hasWord('literature')) {
    return 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'; // Literature study books
  }

  // 27. Sciences (Physics, Chemistry, Math, Botany, Zoology, Micro, Forensic, Yoga)
  if (hasWord('chemistry')) {
    return 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=800&q=80'; // Chemistry glassware
  }
  if (hasWord('physics')) {
    return 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80'; // Physics optics
  }
  if (hasWord('mathematics') || hasWord('math')) {
    return 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80'; // Calculus mathematics
  }
  if (hasWord('botany')) {
    return 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80'; // Botanical plant
  }
  if (hasWord('zoology')) {
    return 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=800&q=80'; // Wildlife animal
  }
  if (hasWord('microbiology') || hasPhrase('micro biology') || hasWord('forensic')) {
    return 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80'; // Laboratory petri dish
  }
  if (hasWord('yoga') || hasWord('yogic')) {
    return 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80'; // Yoga meditation
  }

  // 28. Journalism & Media (BAJMC, MAJMC)
  if (hasWord('journalism') || hasPhrase('mass com') || hasWord('bajmc') || hasWord('majmc')) {
    return 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=800&q=80'; // Broadcast microphone & camera
  }

  // 29. Music & Dance
  if (hasWord('music') || hasWord('dance')) {
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'; // Music instrument
  }

  // 30. Fashion Design (BFD)
  if (hasWord('fashion') || hasWord('bfd')) {
    return 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80'; // Fashion design
  }

  // 31. Fine Arts (BFA, MFA)
  if (hasWord('fine') || hasWord('bfa') || hasWord('mfa')) {
    return 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80'; // Artist canvas & palette
  }

  // 32. Performing Arts (BPA, MPA)
  if (hasWord('bpa') || hasWord('mpa') || hasPhrase('performing arts')) {
    return 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=800&q=80'; // Stage performance
  }

  // 33. Library Science (B.Lib, M.Lib)
  if (hasWord('blib') || hasWord('mlib') || hasWord('library')) {
    return 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80'; // Library books
  }

  // 34. Social Work (MSW, BSW)
  if (hasWord('msw') || hasWord('bsw') || hasPhrase('social work')) {
    return 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=80'; // Social community work
  }

  // 35. Category Fallbacks
  if (cat.includes('science')) {
    return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('commerce')) {
    return 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('computer')) {
    return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('law')) {
    return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('research')) {
    return 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80';
  }

  // Final academic fallback
  return 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80';
}
