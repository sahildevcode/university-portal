import mongoose from 'mongoose';
import { connectMongoDB, CourseModel } from '../db_mongo.js';

const default62Courses = [
  { id: 'c-1',  name: 'BA',                                    duration: '3 Years', category: 'Arts',      code: 'BA',        description: 'Bachelor of Arts degree with humanities, literature, and social sciences curriculum.' },
  { id: 'c-2',  name: 'MA (Education)',                        duration: '2 Years', category: 'Arts',      code: 'MA-EDU',    description: 'Master of Arts in Education covering pedagogy, educational psychology, and curriculum design.' },
  { id: 'c-3',  name: 'MA (History)',                          duration: '2 Years', category: 'Arts',      code: 'MA-HIS',    description: 'Postgraduate degree in World and Indian History, historiography, and research.' },
  { id: 'c-4',  name: 'MA (English)',                          duration: '2 Years', category: 'Arts',      code: 'MA-ENG',    description: 'Master of Arts in English Literature, linguistics, and critical theory.' },
  { id: 'c-5',  name: 'MA (Sociology)',                        duration: '2 Years', category: 'Arts',      code: 'MA-SOC',    description: 'Advanced study of human society, social structures, and research methodologies.' },
  { id: 'c-6',  name: 'MA (Economics)',                        duration: '2 Years', category: 'Arts',      code: 'MA-ECO',    description: 'Micro and macroeconomics, econometrics, public finance, and policy development.' },
  { id: 'c-7',  name: 'MA (Political Science)',                duration: '2 Years', category: 'Arts',      code: 'MA-POL',    description: 'International relations, political theory, governance, and public administration.' },
  { id: 'c-8',  name: 'MA (Hindi)',                            duration: '2 Years', category: 'Arts',      code: 'MA-HIN',    description: 'Hindi literature, poetry, prose, and linguistic heritage.' },
  { id: 'c-9',  name: 'MA (Yoga)',                             duration: '2 Years', category: 'Arts',      code: 'MA-YOG',    description: 'Yogic science, philosophy, naturopathy, and holistic wellness training.' },
  { id: 'c-10', name: 'BSW',                                   duration: '3 Years', category: 'Arts',      code: 'BSW',       description: 'Bachelor of Social Work focusing on community development, NGO management, and welfare.' },
  { id: 'c-11', name: 'MSW',                                   duration: '2 Years', category: 'Arts',      code: 'MSW',       description: 'Master of Social Work in HR, medical & psychiatric social work, and rural development.' },
  { id: 'c-12', name: 'B.Com.',                                duration: '3 Years', category: 'Commerce',  code: 'BCOM',      description: 'Financial accounting, auditing, business economics, and corporate law.' },
  { id: 'c-13', name: 'M.Com.',                                duration: '2 Years', category: 'Commerce',  code: 'MCOM',      description: 'Advanced corporate accounting, taxation, financial analysis, and banking.' },
  { id: 'c-14', name: 'B.Sc.',                                 duration: '3 Years', category: 'Science',   code: 'BSC',       description: 'Bachelor of Science covering foundational & applied natural sciences with practical labs.' },
  { id: 'c-15', name: 'M.Sc.(Physics)',                        duration: '2 Years', category: 'Science',   code: 'MSC-PHY',   description: 'Quantum mechanics, electronics, solid state physics, and laboratory research.' },
  { id: 'c-16', name: 'M.Sc.(Chemistry)',                      duration: '2 Years', category: 'Science',   code: 'MSC-CHE',   description: 'Organic, inorganic, and physical chemistry with advanced laboratory synthesis.' },
  { id: 'c-17', name: 'M.Sc.(Mathematics)',                    duration: '2 Years', category: 'Science',   code: 'MSC-MATH',  description: 'Abstract algebra, real analysis, differential equations, and computational math.' },
  { id: 'c-18', name: 'M.Sc.(Zoology)',                        duration: '2 Years', category: 'Science',   code: 'MSC-ZOO',   description: 'Animal biology, cell genetics, ecology, physiology, and laboratory dissection.' },
  { id: 'c-19', name: 'M.Sc.(Botany)',                         duration: '2 Years', category: 'Science',   code: 'MSC-BOT',   description: 'Plant taxonomy, biotechnology, plant pathology, and environmental biology.' },
  { id: 'c-20', name: 'M.Sc.(Yogic Science)',                  duration: '2 Years', category: 'Science',   code: 'MSC-YOG',   description: 'Anatomy, human physiology, yogic therapy, and scientific wellness research.' },
  { id: 'c-21', name: 'M.Sc.(Forensic Science)',               duration: '2 Years', category: 'Science',   code: 'MSC-FOR',   description: 'Crime scene investigation, forensic toxicology, DNA profiling, and cyber forensics.' },
  { id: 'c-22', name: 'M.Sc.(Micro Biology)',                  duration: '2 Years', category: 'Science',   code: 'MSC-MIC',   description: 'Bacteriology, virology, immunology, industrial microbiology, and lab genetics.' },
  { id: 'c-23', name: 'M.Sc.(Computer Science)',               duration: '2 Years', category: 'Science',   code: 'MSC-CS',    description: 'Advanced computer science algorithms, cloud computing, AI, and system software.' },
  { id: 'c-24', name: 'B.B.A.',                                duration: '3 Years', category: 'Commerce',  code: 'BBA',       description: 'Business administration, marketing strategy, HR management, and corporate finance.' },
  { id: 'c-25', name: 'M.B.A.',                                duration: '2 Years', category: 'Commerce',  code: 'MBA',       description: 'Master of Business Administration in strategic management, fintech, and global business.' },
  { id: 'c-26', name: 'B.Lib',                                 duration: '1 Year',  category: 'Commerce',  code: 'BLIB',      description: 'Bachelor of Library and Information Science in digital archiving and cataloging.' },
  { id: 'c-27', name: 'M.Lib',                                 duration: '1 Year',  category: 'Commerce',  code: 'MLIB',      description: 'Master degree in digital library management, information networks, and documentation.' },
  { id: 'c-28', name: 'D.C.A.',                                duration: '1 Year',  category: 'Computer',  code: 'DCA',       description: 'Govt recognized 1-year diploma in computer application, MS Office, internet & Tally.' },
  { id: 'c-29', name: 'P.G.D.C.A.',                            duration: '1 Year',  category: 'Computer',  code: 'PGDCA',     description: 'Postgraduate diploma in computer applications, programming, C++, and database systems.' },
  { id: 'c-30', name: 'B.C.A.',                                duration: '3 Years', category: 'Computer',  code: 'BCA',       description: 'Bachelor of Computer Applications covering web dev, Java, Python, SQL, and DSA.' },
  { id: 'c-31', name: 'M.C.A.',                                duration: '2 Years', category: 'Computer',  code: 'MCA',       description: 'Master of Computer Applications in full stack engineering, cloud, and enterprise AI.' },
  { id: 'c-32', name: 'B.Pharm',                               duration: '4 Years', category: 'Science',   code: 'BPHARM',    description: 'Bachelor of Pharmacy in pharmacology, drug synthesis, and clinical pharmacy.' },
  { id: 'c-33', name: 'D.Pharm',                               duration: '2 Years', category: 'Science',   code: 'DPHARM',    description: 'Diploma in Pharmacy for retail dispensing, drug chemistry, and medical store license.' },
  { id: 'c-34', name: 'B.Sc.(Hons) Agriculture',               duration: '4 Years', category: 'Science',   code: 'BSC-AGRI',  description: 'Agricultural engineering, crop production, soil fertility, and farming technology.' },
  { id: 'c-35', name: 'M.Sc. Agriculture (Soil Science)',       duration: '2 Years', category: 'Science',   code: 'MSC-AGRI-SOIL', description: 'Soil chemistry, nutrient management, soil physics, and fertility research.' },
  { id: 'c-36', name: 'M.Sc. Agriculture (Agronomy)',           duration: '2 Years', category: 'Science',   code: 'MSC-AGRI-AGRO', description: 'Crop physiology, weed management, sustainable farming, and seed technology.' },
  { id: 'c-37', name: 'M.Sc. Agriculture (Plant Pathology)',    duration: '2 Years', category: 'Science',   code: 'MSC-AGRI-PATH', description: 'Plant disease diagnostics, mycology, bacteriology, and crop protection.' },
  { id: 'c-38', name: 'LLB',                                   duration: '3 Years', category: 'Law',       code: 'LLB',       description: 'Bachelor of Laws in Indian constitution, criminal law, civil procedure, and advocacy.' },
  { id: 'c-39', name: 'B.A.LLB',                               duration: '5 Years', category: 'Law',       code: 'BALLB',     description: '5-year integrated law degree combining humanities and legal education for advocacy.' },
  { id: 'c-40', name: 'L.L.M.',                                 duration: '2 Years', category: 'Law',       code: 'LLM',       description: 'Master of Laws specializing in constitutional law, corporate law, and human rights.' },
  { id: 'c-41', name: 'BPA',                                   duration: '4 Years', category: 'Arts',      code: 'BPA',       description: 'Bachelor of Performing Arts in Indian classical music, dance, and theatrical arts.' },
  { id: 'c-42', name: 'MPA',                                   duration: '2 Years', category: 'Arts',      code: 'MPA',       description: 'Master of Performing Arts in classical music composition, stagecraft, and choreography.' },
  { id: 'c-43', name: 'BFA',                                   duration: '4 Years', category: 'Arts',      code: 'BFA',       description: 'Bachelor of Fine Arts in painting, sculpture, visual communications, and graphic design.' },
  { id: 'c-44', name: 'MFA',                                   duration: '2 Years', category: 'Arts',      code: 'MFA',       description: 'Master of Fine Arts in creative direction, visual aesthetics, and gallery exhibitions.' },
  { id: 'c-45', name: 'B.Music / B.Dance',                     duration: '3 Years', category: 'Arts',      code: 'BMUSIC',    description: 'Degree program in vocal, instrumental music, and traditional Indian dance forms.' },
  { id: 'c-46', name: 'M.Music / M.Dance',                     duration: '2 Years', category: 'Arts',      code: 'MMUSIC',    description: 'Postgraduate degree in classical music ragas, dance theory, and performance.' },
  { id: 'c-47', name: 'BAJMC',                                  duration: '3 Years', category: 'Arts',      code: 'BAJMC',     description: 'Journalism and mass communication in news reporting, digital media, and broadcasting.' },
  { id: 'c-48', name: 'MAJMC',                                  duration: '2 Years', category: 'Arts',      code: 'MAJMC',     description: 'Master degree in investigative journalism, public relations, and media production.' },
  { id: 'c-49', name: 'B.P.ED',                                 duration: '2 Years', category: 'Arts',      code: 'BPED',      description: 'Bachelor of Physical Education in sports training, athletics, and physical fitness.' },
  { id: 'c-50', name: 'BPES',                                   duration: '3 Years', category: 'Arts',      code: 'BPES',      description: 'Bachelor of Physical Education and Sports science, coaching, and kinesiology.' },
  { id: 'c-51', name: 'MPES',                                   duration: '2 Years', category: 'Arts',      code: 'MPES',      description: 'Master of Physical Education and Sports medicine, sports management, and exercise science.' },
  { id: 'c-52', name: 'B.Tech',                                 duration: '4 Years', category: 'Computer',  code: 'BTECH',     description: 'Bachelor of Technology engineering degree covering technical software systems and hardware.' },
  { id: 'c-53', name: 'M.Tech',                                 duration: '2 Years', category: 'Computer',  code: 'MTECH',     description: 'Master of Technology in advanced computer engineering, VLSI, cloud systems, and AI.' },
  { id: 'c-54', name: 'DMLT',                                   duration: '2 Years', category: 'Science',   code: 'DMLT',      description: 'Diploma in Medical Laboratory Technology for pathology labs and diagnostic testing.' },
  { id: 'c-55', name: 'BMLT',                                   duration: '3 Years', category: 'Science',   code: 'BMLT',      description: 'Bachelor of Medical Laboratory Technology in biochemistry, hematology, and lab management.' },
  { id: 'c-56', name: 'B.P.ED.',                                duration: '2 Years', category: 'Arts',      code: 'BPED2',     description: 'Professional physical education degree for school sports instructors and athletic coaches.' },
  { id: 'c-57', name: 'Ph.D. (Social Science)',                  duration: '3 Years', category: 'Research',  code: 'PHD-SOC',   description: 'Doctoral research degree in social sciences with thesis publication and defense.' },
  { id: 'c-58', name: 'Ph.D. (Science)',                        duration: '3 Years', category: 'Research',  code: 'PHD-SCI',   description: 'Doctoral research degree in natural sciences with lab experiments and journal publications.' },
  { id: 'c-59', name: 'Ph.D. (Education)',                      duration: '3 Years', category: 'Research',  code: 'PHD-EDU',   description: 'Doctorate in educational theory, policy research, and pedagogical innovation.' },
  { id: 'c-60', name: 'Ph.D. (Commerce / Management)',           duration: '3 Years', category: 'Research',  code: 'PHD-COM',   description: 'Doctorate in corporate finance, business strategy, economics, and marketing research.' },
  { id: 'c-61', name: 'Ph.D. (Law)',                            duration: '3 Years', category: 'Research',  code: 'PHD-LAW',   description: 'Doctoral research in constitutional law, jurisprudence, and international legal frameworks.' },
  { id: 'c-62', name: 'Ph.D. (Engineering)',                    duration: '3 Years', category: 'Research',  code: 'PHD-ENG',   description: 'Doctorate in engineering, computer science, technical research, and patent development.' },
  { id: 'c-63', name: 'BFD (Fashion Design)',                   duration: '3 Years', category: 'Scholarship Benefit', code: 'BFD', description: 'Bachelor of Fashion Design & Garment Technology with 100% MPTASS/NSP Scholarship Benefit.' },
];

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI missing.');
    process.exit(1);
  }

  await connectMongoDB(mongoUri);
  console.log('🌱 Seeding 62 courses into MongoDB Atlas...');

  for (const course of default62Courses) {
    await CourseModel.updateOne(
      { id: course.id },
      { $setOnInsert: { ...course, createdAt: new Date().toISOString() } },
      { upsert: true }
    );
  }

  console.log('🎉 62 COURSES SUCCESSFULLY SEEDED INTO MONGODB ATLAS!');
  await mongoose.disconnect();
  process.exit(0);
}

seed();
