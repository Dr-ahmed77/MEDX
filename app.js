// ══════════════════════════════════════════
// MEDIX PRO — app.js — Sans IA
// ══════════════════════════════════════════

// ── Firebase ──
const firebaseConfig = {
  apiKey: "AIzaSyA1zwmnlXIeHQDfkzhNbT0vdhus5kWLB-w",
  authDomain: "medix-517ae.firebaseapp.com",
  projectId: "medix-517ae",
  storageBucket: "medix-517ae.firebasestorage.app",
  messagingSenderId: "422565745821",
  appId: "1:422565745821:web:ee8bab723337181b4c7074"
};
let app, db, auth;
try { app = firebase.initializeApp(firebaseConfig); db = firebase.firestore(); auth = firebase.auth(); }
catch(e) {}

// ── State ──
let currentUser = null;
let userData = { name:'Étudiant', email:'', year:'1', uid:null, xp:0, level:1, streak:0, lastStudy:null, qcmSolved:0, qcmCorrect:0, history:[], examHistory:[] };
let examConfig = { q:10, t:15 };
let qcmState = { questions:[], idx:0, score:0, cat:'', startTime:null, timer:null };
let examState = { questions:[], answers:[], idx:0, title:'', cat:'', startTime:null, timerInterval:null, timeLimit:900 };

// ── Data ──
const YEARS = [
  { id:1, n:'01', title:'1ère Année', desc:'Anatomie, Biologie, Chimie, Physique', c:'#0066FF' },
  { id:2, n:'02', title:'2ème Année', desc:'Biochimie, Histologie, Physiologie', c:'#00D4AA' },
  { id:3, n:'03', title:'3ème Année', desc:'Anatomie pathologique, Pharmacologie', c:'#FF6B6B' },
  { id:4, n:'04', title:'4ème Année', desc:'Médecine interne, Chirurgie, Pédiatrie', c:'#FFB800' },
  { id:5, n:'05', title:'5ème Année', desc:'Gynécologie, Psychiatrie, Urgences', c:'#8B5CF6' },
  { id:6, n:'06', title:'6ème Année', desc:'Stage clinique, Préparation Résidanat', c:'#EC4899' }
];
const LEADERS = [
  { name:'Ahmed Benali', xp:8250, year:'5', av:'A' },
  { name:'Sara Mohammedi', xp:7980, year:'4', av:'S' },
  { name:'Youssef Kamal', xp:7340, year:'6', av:'Y' },
  { name:'Nour Elhoda', xp:6800, year:'3', av:'N' },
  { name:'Karim Abdelkader', xp:6100, year:'5', av:'K' }
];
const ACHIEVEMENTS = [
  { icon:'🔥', title:'Persévérant', desc:'7 jours consécutifs', key:'streak7' },
  { icon:'🎯', title:'Tireur d\'élite', desc:'100% dans un QCM', key:'perfect' },
  { icon:'📚', title:'Apprenant', desc:'10 QCM résolus', key:'qcm10' },
  { icon:'⚡', title:'Rapide', desc:'QCM en moins de 3 min', key:'fast' },
  { icon:'🏆', title:'Expert', desc:'50 QCM résolus', key:'qcm50' },
  { icon:'🌟', title:'Brillant', desc:'100 QCM résolus', key:'qcm100' },
  { icon:'💎', title:'Diamant', desc:'Atteindre le niveau 10', key:'level10' },
  { icon:'🎓', title:'Médecin', desc:'Compléter 5 examens', key:'exam5' },
  { icon:'🦾', title:'Invincible', desc:'Précision > 90%', key:'acc90' }
];
const LIBRARY = [
  { cat:'anatomy', title:'Anatomie du système nerveux central', type:'video', thumb:'🧠', duration:'52 min', rating:'4.9', year:'2' },
  { cat:'anatomy', title:'Anatomie de l\'appareil locomoteur', type:'video', thumb:'🦴', duration:'38 min', rating:'4.8', year:'1' },
  { cat:'physiology', title:'Physiologie rénale et diurèse', type:'video', thumb:'🫘', duration:'65 min', rating:'4.7', year:'2' },
  { cat:'physiology', title:'Physiologie cardiovasculaire', type:'video', thumb:'❤️', duration:'48 min', rating:'4.9', year:'2' },
  { cat:'pharmacology', title:'Antibiotiques : classification et usage', type:'pdf', thumb:'💊', pages:24, rating:'4.8', year:'3' },
  { cat:'pharmacology', title:'Anticoagulants et antiagrégants', type:'pdf', thumb:'🩸', pages:18, rating:'4.6', year:'4' },
  { cat:'cardiology', title:'Séméiologie cardiaque', type:'video', thumb:'🫀', duration:'41 min', rating:'4.9', year:'3' },
  { cat:'cardiology', title:'Insuffisance cardiaque : diagnostic', type:'pdf', thumb:'📋', pages:32, rating:'4.7', year:'4' },
  { cat:'neurology', title:'AVC : prise en charge urgente', type:'video', thumb:'🧬', duration:'35 min', rating:'4.8', year:'5' },
  { cat:'neurology', title:'Épilepsie : classification et traitement', type:'pdf', thumb:'⚡', pages:28, rating:'4.6', year:'4' },
  { cat:'microbiology', title:'Bactériologie générale', type:'video', thumb:'🦠', duration:'45 min', rating:'4.7', year:'1' },
  { cat:'microbiology', title:'Virologie : mécanismes d\'infection', type:'pdf', thumb:'🔬', pages:20, rating:'4.5', year:'2' }
];
// ══════════════════════════════════════════
// QCM_BANK — BANQUE DE QUESTIONS
// ══════════════════════════════════════════
// 📝 COMMENT MODIFIER LES QUESTIONS :
//
//  • Chaque matière contient : label, icon, color, questions[]
//  • Chaque question contient :
//      q    → le texte de la question
//      opts → tableau de 4 options [A, B, C, D]
//      a    → index de la bonne réponse (0=A, 1=B, 2=C, 3=D)
//      exp  → explication affichée après la réponse
//
//  ✅ Pour AJOUTER une question : copiez un bloc { q:..., opts:..., a:..., exp:... }
//     et collez-le dans la matière voulue (n'oubliez pas la virgule avant)
//  ✏️  Pour MODIFIER : changez directement le texte
//  🗑  Pour SUPPRIMER : supprimez le bloc entier { ... },
// ══════════════════════════════════════════

const QCM_BANK = {

  // ════════════════════════════════
  // 🦴 ANATOMIE
  // ════════════════════════════════
  anatomy: {
    label: 'Anatomie',
    icon: '🦴',
    color: '#0066FF',
    questions: [

      {
        q: 'Le nerf sciatique est une branche du plexus :',
        opts: ['Cervical', 'Brachial', 'Lombaire', 'Sacré'],
        a: 3,
        exp: 'Le nerf sciatique (grand nerf ischiatique) est issu du plexus sacré (L4-S3). C'est le plus grand nerf du corps humain.'
      },

      {
        q: 'L'artère coronaire gauche se divise en :',
        opts: ['IVA et Cx', 'IVP et marginale', 'Auriculaire et IVA', 'Cx et RD'],
        a: 0,
        exp: 'L'artère coronaire gauche (tronc commun gauche) se divise en artère interventriculaire antérieure (IVA) et artère circonflexe (Cx).'
      },

      {
        q: 'Le muscle sternocleidomastoïdien est innervé par :',
        opts: ['Nerf facial (VII)', 'Nerf accessoire (XI)', 'Nerf vague (X)', 'Nerf hypoglosse (XII)'],
        a: 1,
        exp: 'Le muscle SCM est innervé par le nerf accessoire (XI) et par des branches du plexus cervical (C2-C3).'
      },

      {
        q: 'Le foramen oval est situé dans :',
        opts: ['Le temporal', 'L'occipital', 'Le sphénoïde', 'L'ethmoïde'],
        a: 2,
        exp: 'Le foramen oval est situé dans la grande aile du sphénoïde. Il laisse passer le V3 (nerf mandibulaire).'
      },

      {
        q: 'La veine porte est formée par la réunion de :',
        opts: ['VMS + VSM', 'VMI + VSM', 'VMS + VSI', 'Veine splénique + VMS'],
        a: 3,
        exp: 'La veine porte est formée par la réunion de la veine mésentérique supérieure (VMS) et de la veine splénique, derrière le col du pancréas.'
      },

      {
        q: 'L'artère rénale gauche naît de :',
        opts: ['L'aorte au niveau L1', 'L'aorte au niveau L2', 'L'aorte au niveau L3', 'La veine cave inférieure'],
        a: 1,
        exp: 'Les artères rénales naissent de l'aorte abdominale au niveau L2. La gauche est plus courte, la droite passe derrière la VCI.'
      },

      {
        q: 'Le nerf cubital (ulnaire) traverse :',
        opts: ['La gouttière épitrochléo-olécrânienne', 'Le canal carpien', 'La gouttière du nerf radial', 'Le canal de Guyon'],
        a: 0,
        exp: 'Le nerf cubital passe dans la gouttière épitrochléo-olécrânienne au coude. Il peut aussi être comprimé dans le canal de Guyon au poignet.'
      },

      {
        q: 'Le canal de Guyon contient :',
        opts: ['Le nerf médian', 'Le nerf radial', 'Le nerf ulnaire', 'Le nerf musculo-cutané'],
        a: 2,
        exp: 'Le canal de Guyon est situé au poignet et contient le nerf ulnaire (cubital) et l'artère ulnaire.'
      },

      {
        q: 'L'appendice est le plus souvent situé :',
        opts: ['En position pelvienne', 'En position rétro-caecale', 'En position latéro-caecale', 'En position sous-hépatique'],
        a: 1,
        exp: 'L'appendice vermiculaire est dans 65% des cas en position rétro-caecale. La position pelvienne représente environ 30% des cas.'
      },

      {
        q: 'Le ganglion de Gasser est le ganglion sensitif de :',
        opts: ['Nerf facial (VII)', 'Nerf trijumeau (V)', 'Nerf glossopharyngien (IX)', 'Nerf vague (X)'],
        a: 1,
        exp: 'Le ganglion de Gasser (ganglion trigéminal) est le ganglion sensitif du nerf trijumeau (V). Il est situé dans la cavité de Meckel.'
      },

    ]
  },

  // ════════════════════════════════
  // ⚡ PHYSIOLOGIE
  // ════════════════════════════════
  physiology: {
    label: 'Physiologie',
    icon: '⚡',
    color: '#00D4AA',
    questions: [

      {
        q: 'La pression artérielle systolique normale est :',
        opts: ['60-80 mmHg', '80-100 mmHg', '100-140 mmHg', '140-160 mmHg'],
        a: 2,
        exp: 'La pression artérielle systolique normale est entre 100 et 140 mmHg. Au-delà de 140 mmHg, on parle d'hypertension artérielle.'
      },

      {
        q: 'La capacité vitale normale est d'environ :',
        opts: ['1-2 litres', '3-5 litres', '6-8 litres', '8-10 litres'],
        a: 1,
        exp: 'La capacité vitale est d'environ 3,5 à 4,5 litres chez un adulte sain. Elle représente le volume maximum expiré après une inspiration maximale.'
      },

      {
        q: 'Le pH sanguin normal est :',
        opts: ['7.0 - 7.2', '7.2 - 7.35', '7.35 - 7.45', '7.45 - 7.6'],
        a: 2,
        exp: 'Le pH sanguin normal est strictement maintenu entre 7,35 et 7,45. En dessous : acidose. Au dessus : alcalose.'
      },

      {
        q: 'La durée normale du cycle cardiaque est de :',
        opts: ['0.3 secondes', '0.5 secondes', '0.8 secondes', '1.2 secondes'],
        a: 2,
        exp: 'À une fréquence de 75 batt/min, le cycle cardiaque dure 0,8 secondes : 0,3s de systole et 0,5s de diastole.'
      },

      {
        q: 'La filtration glomérulaire normale est de :',
        opts: ['30-60 mL/min', '60-90 mL/min', '90-120 mL/min', '120-180 mL/min'],
        a: 2,
        exp: 'Le DFG normal est de 90 à 120 mL/min/1,73m². En dessous de 60 mL/min, on parle d'insuffisance rénale.'
      },

      {
        q: 'Le potentiel de repos de la membrane est d'environ :',
        opts: ['-30 mV', '-50 mV', '-70 mV', '-90 mV'],
        a: 2,
        exp: 'Le potentiel de repos est d'environ -70 mV. Il est maintenu par la pompe Na+/K+-ATPase.'
      },

      {
        q: 'La concentration normale de glucose à jeun est :',
        opts: ['2-4 mmol/L', '4-6 mmol/L', '6-8 mmol/L', '8-10 mmol/L'],
        a: 1,
        exp: 'La glycémie normale à jeun est de 4 à 6 mmol/L (0,7 à 1,1 g/L). Au-delà de 7 mmol/L à jeun : diabète.'
      },

      {
        q: 'Le volume systolique normal au repos est d'environ :',
        opts: ['30-40 mL', '50-70 mL', '80-110 mL', '120-150 mL'],
        a: 1,
        exp: 'Le volume systolique normal est d'environ 50-70 mL au repos. Débit cardiaque = VS × FC ≈ 4-5 L/min.'
      },

      {
        q: 'La saturation en oxygène (SpO2) normale est :',
        opts: ['85-90%', '90-94%', '95-100%', '100%'],
        a: 2,
        exp: 'La SpO2 normale est de 95 à 100%. En dessous de 90% : hypoxémie sévère nécessitant une oxygénothérapie.'
      },

      {
        q: 'Le péristaltisme intestinal est contrôlé principalement par :',
        opts: ['Le système nerveux central', 'Le système nerveux entérique', 'Le système nerveux sympathique', 'Les hormones surrénaliennes'],
        a: 1,
        exp: 'Le péristaltisme est contrôlé par le système nerveux entérique (plexus d'Auerbach et Meissner), appelé le "deuxième cerveau".'
      },

    ]
  },

  // ════════════════════════════════
  // 💊 PHARMACOLOGIE
  // ════════════════════════════════
  pharmacology: {
    label: 'Pharmacologie',
    icon: '💊',
    color: '#8B5CF6',
    questions: [

      {
        q: 'L'amoxicilline appartient à la famille des :',
        opts: ['Céphalosporines', 'Pénicillines', 'Macrolides', 'Fluoroquinolones'],
        a: 1,
        exp: 'L'amoxicilline est une aminopénicilline. Elle inhibe la synthèse de la paroi bactérienne en bloquant les PLP.'
      },

      {
        q: 'La warfarine (Coumadine) est un antagoniste de :',
        opts: ['La vitamine C', 'La vitamine D', 'La vitamine K', 'La vitamine B12'],
        a: 2,
        exp: 'La warfarine inhibe la vitamine K époxyde réductase. Elle bloque la synthèse des facteurs II, VII, IX et X.'
      },

      {
        q: 'L'aspirine à faible dose inhibe :',
        opts: ['La COX-1 uniquement', 'La COX-2 uniquement', 'Les deux COX', 'La lipoxygénase'],
        a: 0,
        exp: 'L'aspirine à faible dose (75-150 mg) inhibe de façon irréversible la COX-1 plaquettaire, réduisant la synthèse de TXA2.'
      },

      {
        q: 'Les béta-bloquants sont contre-indiqués dans :',
        opts: ['L'hypertension', 'L'asthme', 'L'angor', 'La tachycardie'],
        a: 1,
        exp: 'Les béta-bloquants sont contre-indiqués dans l'asthme car le blocage des récepteurs béta-2 bronchiques provoque un bronchospasme.'
      },

      {
        q: 'La digoxine agit en inhibant :',
        opts: ['La pompe Na+/K+-ATPase', 'Les canaux calciques', 'Les récepteurs béta-adrénergiques', 'Les canaux sodiques'],
        a: 0,
        exp: 'La digoxine inhibe la pompe Na+/K+-ATPase, augmentant le Ca2+ intracellulaire et donc la contractilité myocardique.'
      },

      {
        q: 'Les IEC inhibent la conversion de :',
        opts: ['Rénine → Angiotensine I', 'Angiotensine I → Angiotensine II', 'Angiotensine II → Aldostérone', 'Bradykinine → métabolites inactifs'],
        a: 1,
        exp: 'Les IEC bloquent l'ECA qui transforme l'angiotensine I en angiotensine II. Ils réduisent aussi la dégradation de la bradykinine (d'où la toux sèche).'
      },

      {
        q: 'Le méthotrexate est un antimétabolite analogue de :',
        opts: ['L'adénine', 'La thymine', 'L'acide folique', 'L'uracile'],
        a: 2,
        exp: 'Le méthotrexate inhibe la dihydrofolate réductase (DHFR), bloquant la synthèse des nucléotides. Utilisé comme anticancéreux et immunosuppresseur.'
      },

      {
        q: 'La morphine est un agoniste des récepteurs :',
        opts: ['Alpha-adrénergiques', 'Béta-adrénergiques', 'Opioïdes mu', 'Dopaminergiques'],
        a: 2,
        exp: 'La morphine est un agoniste des récepteurs opioïdes mu (μ). Ils médient l'analgésie mais aussi la dépression respiratoire et la dépendance.'
      },

    ]
  },

  // ════════════════════════════════
  // ❤️ CARDIOLOGIE
  // ════════════════════════════════
  cardiology: {
    label: 'Cardiologie',
    icon: '❤️',
    color: '#FF6B6B',
    questions: [

      {
        q: 'L'onde P de l'ECG correspond à :',
        opts: ['La dépolarisation ventriculaire', 'La repolarisation ventriculaire', 'La dépolarisation auriculaire', 'La repolarisation auriculaire'],
        a: 2,
        exp: 'L'onde P correspond à la dépolarisation auriculaire. Sa durée normale est < 120 ms.'
      },

      {
        q: 'L'insuffisance cardiaque gauche se manifeste par :',
        opts: ['Œdèmes des membres inférieurs', 'Turgescence jugulaire', 'Dyspnée et OAP', 'Hépatomégalie'],
        a: 2,
        exp: 'L'IC gauche entraîne une congestion pulmonaire : dyspnée d'effort, orthopnée, OAP. L'IC droite donne les signes veineux systémiques.'
      },

      {
        q: 'La fibrillation auriculaire se caractérise par :',
        opts: ['Rythme régulier avec ondes P normales', 'Absence d'ondes P, rythme irrégulier', 'Ondes P larges et encoché', 'Allongement du PR'],
        a: 1,
        exp: 'La FA est caractérisée par une activité auriculaire chaotique (absence d'ondes P) avec une réponse ventriculaire irrégulière.'
      },

      {
        q: 'Le signe de De Musset est observé dans :',
        opts: ['Le rétrécissement mitral', 'L'insuffisance aortique', 'La péricardite', 'La myocardiopathie'],
        a: 1,
        exp: 'Le signe de De Musset (oscillation de la tête synchrone au pouls) est un signe d'insuffisance aortique sévère, dû à la forte pression pulsée.'
      },

      {
        q: 'Le traitement de 1ère intention de l'HTA essentielle non compliquée :',
        opts: ['Bêta-bloquants', 'IEC ou ARA2', 'Diurétiques de l'anse', 'Inhibiteurs calciques vérapamil'],
        a: 1,
        exp: 'Les IEC (ou ARA2) sont recommandés en première intention dans l'HTA essentielle, surtout avec diabète ou protéinurie.'
      },

      {
        q: 'L'intervalle QT normal est :',
        opts: ['< 300 ms', '300-440 ms', '440-500 ms', '> 500 ms'],
        a: 1,
        exp: 'Le QT normal est < 440 ms chez l'homme et < 460 ms chez la femme. Au-delà de 500 ms, le risque de torsades de pointes augmente.'
      },

      {
        q: 'L'endocardite infectieuse se manifeste typiquement par :',
        opts: ['Fièvre + souffle cardiaque', 'Hypotension + bradycardie', 'Cyanose + dyspnée', 'Douleur thoracique + sus-décalage ST'],
        a: 0,
        exp: 'Triade classique : fièvre prolongée + souffle cardiaque + porte d'entrée infectieuse. Confirmée par hémocultures et écho (végétation).'
      },

    ]
  },

  // ════════════════════════════════
  // 🧠 NEUROLOGIE
  // ════════════════════════════════
  neurology: {
    label: 'Neurologie',
    icon: '🧠',
    color: '#FFB800',
    questions: [

      {
        q: 'L'AVC ischémique dans le territoire de l'ACM gauche entraîne :',
        opts: ['Hémiplégie droite + aphasie', 'Hémiplégie gauche', 'Syndrome cérébelleux', 'Syndrome de la queue de cheval'],
        a: 0,
        exp: 'L'occlusion de l'ACM gauche entraîne : hémiplégie droite brachio-faciale + hémianesthésie + hémianopsie + aphasie (hémisphère dominant).'
      },

      {
        q: 'Le syndrome de Claude Bernard-Horner comprend :',
        opts: ['Mydriase + exophtalmie', 'Myosis + ptosis + énophtalmie', 'Diplopie + nystagmus', 'Paralysie faciale + surdité'],
        a: 1,
        exp: 'Le syndrome de CBH résulte de l'interruption de la voie sympathique : myosis + ptosis + énophtalmie + anhidrose homolatérale.'
      },

      {
        q: 'La sclérose en plaques est caractérisée par :',
        opts: ['Atteinte du SNP', 'Plaques de démyélinisation du SNC', 'Dégénérescence des motoneurones', 'Inflammation des méninges'],
        a: 1,
        exp: 'La SEP est une maladie auto-immune du SNC avec des plaques de démyélinisation disséminées dans l'espace et le temps.'
      },

      {
        q: 'Le traitement de référence de l'épilepsie généralisée est :',
        opts: ['Valproate de sodium', 'Carbamazépine', 'Phénytoïne', 'Lamotrigine seule'],
        a: 0,
        exp: 'Le valproate (Dépakine) est le traitement de référence des épilepsies généralisées. Attention : tératogène, contre-indiqué sans contraception.'
      },

      {
        q: 'La maladie de Parkinson touche les neurones de :',
        opts: ['Substance noire – voie nigrostriée', 'Corps strié', 'Cortex moteur', 'Cervelet'],
        a: 0,
        exp: 'La maladie de Parkinson est due à la dégénérescence des neurones dopaminergiques de la substance noire pars compacta (>70% perdus avant les symptômes).'
      },

      {
        q: 'Le signe de Kernig est positif dans :',
        opts: ['La maladie de Parkinson', 'La méningite', 'L'AVC ischémique', 'L'épilepsie'],
        a: 1,
        exp: 'Le signe de Kernig (résistance à l'extension du genou) est un signe méningé évocateur de méningite, avec raideur de nuque et signe de Brudzinski.'
      },

    ]
  },

  // ════════════════════════════════
  // 🦠 MICROBIOLOGIE
  // ════════════════════════════════
  microbiology: {
    label: 'Microbiologie',
    icon: '🦠',
    color: '#EC4899',
    questions: [

      {
        q: 'La pénicillinase est :',
        opts: ['Un antibiotique', 'Une enzyme bactérienne inactivant les pénicillines', 'Un facteur de virulence', 'Un mécanisme d'efflux'],
        a: 1,
        exp: 'La pénicillinase est une bêta-lactamase qui hydrolyse le cycle bêta-lactame. Les inhibiteurs (acide clavulanique) la neutralisent.'
      },

      {
        q: 'Le SARM (MRSA) est résistant à :',
        opts: ['La vancomycine', 'Toutes les bêta-lactamines', 'Les aminosides', 'La rifampicine'],
        a: 1,
        exp: 'Le SARM est résistant à toutes les bêta-lactamines via la PLP2a (gène mecA). Le traitement de référence est la vancomycine.'
      },

      {
        q: 'La PCR permet :',
        opts: ['De cultiver des bactéries', 'D'amplifier des séquences d'ADN spécifiques', 'De mesurer la résistance', 'De visualiser des virus'],
        a: 1,
        exp: 'La PCR amplifie exponentiellement une séquence d'ADN cible. Elle permet un diagnostic rapide et sensible de nombreux agents infectieux.'
      },

      {
        q: 'L'hépatite C se transmet principalement par :',
        opts: ['Voie oro-fécale', 'Voie sexuelle', 'Voie parentérale (sang)', 'Voie aérienne'],
        a: 2,
        exp: 'Le VHC se transmet principalement par voie parentérale. Les antiviraux à action directe (AAD) permettent la guérison dans >95% des cas.'
      },

      {
        q: 'Le bacille de Koch est :',
        opts: ['Un cocci gram+', 'Un bacille gram-', 'Un bacille acido-alcoolo-résistant (BAAR)', 'Un spirochète'],
        a: 2,
        exp: 'M. tuberculosis est un BAAR (coloration de Ziehl-Neelsen). Sa paroi riche en acides mycoliques lui confère la résistance à la décoloration.'
      },

    ]
  },

};
// ══════════════════════════════════════════
// FIN QCM_BANK
// ══════════════════════════════════════════

// ══════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════
function switchForm(id) { document.querySelectorAll('.auth-form').forEach(f=>f.classList.remove('active')); document.getElementById(id).classList.add('active'); }
function togglePass(id) { const i=document.getElementById(id); i.type=i.type==='password'?'text':'password'; }

function showAuthError(msg) {
  document.querySelectorAll('.auth-error').forEach(e=>e.remove());
  const form = document.querySelector('.auth-form.active');
  if (!form) return;
  const d = document.createElement('div');
  d.className = 'auth-error';
  d.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
  form.insertBefore(d, form.querySelector('.field'));
  setTimeout(()=>d.remove(), 5000);
}

async function loginUser() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  if (!email||!pass) return showAuthError('Veuillez remplir tous les champs');
  const btn = document.querySelector('#loginForm .btn-auth');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
  btn.disabled = true;
  try {
    const cred = await auth.signInWithEmailAndPassword(email, pass);
    await loadUserFromFirestore(cred.user.uid);
    showApp();
  } catch(e) {
    btn.innerHTML = '<span>Se connecter</span><i class="fas fa-arrow-right"></i>';
    btn.disabled = false;
    showAuthError(getAuthError(e.code));
  }
}

async function registerUser() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const year = document.getElementById('regYear').value;
  const pass = document.getElementById('regPassword').value;
  if (!name||!email||!year||!pass) return showAuthError('Veuillez remplir tous les champs');
  if (pass.length < 6) return showAuthError('Le mot de passe doit contenir au moins 6 caractères');
  const btn = document.querySelector('#registerForm .btn-auth');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création...';
  btn.disabled = true;
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    userData = { name, email, year, uid:cred.user.uid, xp:50, level:1, streak:1, lastStudy:new Date().toDateString(), qcmSolved:0, qcmCorrect:0, history:[], examHistory:[] };
    await saveToFirestore();
    showApp();
    showToast(`Bienvenue ${name} ! 🎉`, 'success');
  } catch(e) {
    btn.innerHTML = '<span>Créer mon compte</span><i class="fas fa-arrow-right"></i>';
    btn.disabled = false;
    showAuthError(getAuthError(e.code));
  }
}

function loginAsGuest() {
  userData = { name:'Invité', email:'guest', year:'1', uid:'guest', xp:100, level:1, streak:1, lastStudy:new Date().toDateString(), qcmSolved:3, qcmCorrect:2, history:[], examHistory:[] };
  loadLocal();
  showApp();
  showToast('Bienvenue ! Inscrivez-vous pour sauvegarder votre progression 💡', 'info');
}

async function logoutUser() {
  if (userData.uid !== 'guest') { try { await auth.signOut(); } catch(e){} }
  userData = { name:'Étudiant', email:'', year:'1', uid:null, xp:0, level:1, streak:0, lastStudy:null, qcmSolved:0, qcmCorrect:0, history:[], examHistory:[] };
  document.getElementById('appScreen').style.display = 'none';
  document.getElementById('authScreen').style.display = 'flex';
  document.querySelector('#loginForm .btn-auth').innerHTML = '<span>Se connecter</span><i class="fas fa-arrow-right"></i>';
  document.querySelector('#loginForm .btn-auth').disabled = false;
  switchForm('loginForm');
}

function getAuthError(code) {
  const e = {
    'auth/user-not-found':'E-mail non enregistré',
    'auth/wrong-password':'Mot de passe incorrect',
    'auth/invalid-credential':'E-mail ou mot de passe incorrect',
    'auth/email-already-in-use':'Cet e-mail est déjà utilisé',
    'auth/invalid-email':'Format d\'e-mail invalide',
    'auth/weak-password':'Mot de passe trop faible (6 caractères min.)',
    'auth/too-many-requests':'Trop de tentatives. Réessayez plus tard',
    'auth/network-request-failed':'Problème de connexion internet'
  };
  return e[code] || `Erreur (${code})`;
}

// ══════════════════════════════════════════
// FIREBASE
// ══════════════════════════════════════════
async function loadUserFromFirestore(uid) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) userData = { ...userData, ...doc.data() };
    else { userData.uid = uid; await saveToFirestore(); }
  } catch(e) { loadLocal(); }
}
async function saveToFirestore() {
  if (!userData.uid || userData.uid==='guest') { saveLocal(); return; }
  try { await db.collection('users').doc(userData.uid).set(userData, {merge:true}); }
  catch(e) { saveLocal(); }
}
function saveLocal() { try { localStorage.setItem('medix_user', JSON.stringify(userData)); } catch(e){} }
function loadLocal() { try { const d=localStorage.getItem('medix_user'); if(d) userData={...userData,...JSON.parse(d)}; } catch(e){} }

// ══════════════════════════════════════════
// APP
// ══════════════════════════════════════════
function showApp() {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('appScreen').style.display = 'block';
  updateStreak();
  renderAll();
}

function updateStreak() {
  const today = new Date().toDateString();
  const last = userData.lastStudy;
  if (!last) { userData.streak = 1; }
  else if (last === today) {}
  else {
    const diff = (new Date(today) - new Date(last)) / 86400000;
    if (diff === 1) userData.streak = (userData.streak||0) + 1;
    else if (diff > 1) userData.streak = 1;
  }
  userData.lastStudy = today;
  saveToFirestore();
}

function renderAll() {
  updateUI();
  renderYears();
  renderLeaderboard();
  renderActivity();
  renderQCMGrid();
  renderQCMHistory();
  renderExamSubjects();
  renderExamHistory();
  renderLibrary('all');
  renderStats();
  renderAchievements();
  renderChart();
}

function updateUI() {
  const n = userData.name || 'Étudiant';
  const av = n.charAt(0).toUpperCase();
  setText('navName', n);
  setText('navAv', av); setText('umAv', av); setText('heroName', n);
  setText('umName', n); setText('umEmail', userData.email||'');
  setText('umXP', userData.xp||0); setText('umLvl', userData.level||1); setText('umStreak', userData.streak||0);
  setText('streakBadge', userData.streak||0);
  setText('hsXP', userData.xp||0); setText('hsQCM', userData.qcmSolved||0);
  setText('hsStreak', userData.streak||0);
  const acc = userData.qcmSolved>0 ? Math.round((userData.qcmCorrect/userData.qcmSolved)*100)+'%' : '0%';
  setText('hsAcc', acc);
  setText('stQCM', userData.qcmSolved||0); setText('stAcc', acc);
  setText('stStr', userData.streak||0); setText('stLvl', userData.level||1);
  // XP Ring
  const xpInLevel = (userData.xp||0) % 500;
  const pct = Math.round(xpInLevel / 500 * 100);
  setText('xpPct', pct+'%');
  const ring = document.getElementById('xpRing');
  if (ring) { ring.style.strokeDashoffset = 314 - (314 * pct / 100); }
}

function setText(id, val) { const el=document.getElementById(id); if(el) el.textContent=val; }

function showSection(id, link) {
  document.querySelectorAll('.sec').forEach(s=>s.classList.remove('active'));
  document.getElementById(id+'Section')?.classList.add('active');
  document.querySelectorAll('.nl,.mn').forEach(a=>a.classList.remove('active'));
  if (link) link.classList.add('active');
  else {
    document.querySelectorAll('.nl,.mn').forEach(a=>{ if(a.getAttribute('onclick')?.includes(id)) a.classList.add('active'); });
  }
  toggleMenu(false);
  if (id==='stats') { setTimeout(renderChart, 100); }
}

function toggleMenu(force) {
  const m = document.getElementById('userMenu');
  if (!m) return;
  if (force===false) { m.classList.remove('open'); return; }
  m.classList.toggle('open');
}

// ══════════════════════════════════════════
// HOME RENDERS
// ══════════════════════════════════════════
function renderYears() {
  const c = document.getElementById('yearsGrid');
  if (!c) return;
  c.innerHTML = YEARS.map(y=>`
    <div class="year-card" style="--yc:${y.c}" onclick="showToast('Contenu de ${y.title} bientôt disponible 📚','info')">
      <div class="year-num">${y.n}</div>
      <h3>${y.title}</h3>
      <p>${y.desc}</p>
    </div>`).join('');
}

function renderLeaderboard() {
  const c = document.getElementById('leaderboard');
  if (!c) return;
  const allUsers = [{ name:userData.name, xp:userData.xp||0, year:userData.year, av:(userData.name||'E').charAt(0), isMe:true }, ...LEADERS]
    .sort((a,b)=>b.xp-a.xp).slice(0,6);
  const rankLabels = ['🥇','🥈','🥉','4','5','6'];
  const rankClass = ['gold','silver','bronze','','',''];
  c.innerHTML = allUsers.map((u,i)=>`
    <div class="lb-item" ${u.isMe?'style="background:rgba(0,102,255,.08);border-radius:10px"':''}>
      <span class="lb-rank ${rankClass[i]}">${rankLabels[i]}</span>
      <div class="lb-av">${u.av||u.name.charAt(0)}</div>
      <div class="lb-info"><h4>${u.name}${u.isMe?' (moi)':''}</h4><p>Année ${u.year}</p></div>
      <span class="lb-xp">${u.xp} XP</span>
    </div>`).join('');
}

function renderActivity() {
  const c = document.getElementById('recentActivity');
  if (!c) return;
  const hist = (userData.history||[]).slice(-4).reverse();
  if (!hist.length) {
    c.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:10px 0">Aucune activité récente. Commencez un QCM ! 📝</p>';
    return;
  }
  c.innerHTML = hist.map(h=>`
    <div class="act-item">
      <div class="act-icon qcm"><i class="fas fa-clipboard-list"></i></div>
      <div><h4>QCM — ${QCM_BANK[h.cat]?.label||h.cat}</h4><p>${h.correct}/${h.total} correct • ${Math.round(h.correct/h.total*100)}%</p></div>
      <span class="act-time">${h.date}</span>
    </div>`).join('');
}

// ══════════════════════════════════════════
// QCM
// ══════════════════════════════════════════
function renderQCMGrid() {
  const c = document.getElementById('qcmGrid');
  if (!c) return;
  c.innerHTML = Object.entries(QCM_BANK).map(([key,cat])=>{
    const hist = (userData.history||[]).filter(h=>h.cat===key);
    const best = hist.length ? Math.max(...hist.map(h=>Math.round(h.correct/h.total*100))) : 0;
    return `<div class="qcm-cat-card" onclick="launchQCM('${key}')" style="border-top:3px solid ${cat.color}">
      <div class="qcc-icon">${cat.icon}</div>
      <div class="qcc-label">${cat.label}</div>
      <div class="qcc-count">${cat.questions.length} questions disponibles</div>
      <div class="qcc-bar"><div class="qcc-bar-fill" style="--cc:${cat.color};width:${best}%"></div></div>
      <small style="font-size:11px;color:var(--muted);margin-top:4px;display:block">Meilleur score : ${best}%</small>
    </div>`;
  }).join('');
}

function renderQCMHistory() {
  const c = document.getElementById('qcmHistory');
  if (!c) return;
  const hist = (userData.history||[]).slice(-5).reverse();
  if (!hist.length) { c.innerHTML='<p style="color:var(--muted);font-size:14px">Aucun QCM réalisé pour l\'instant.</p>'; return; }
  c.innerHTML = hist.map(h=>{
    const pct = Math.round(h.correct/h.total*100);
    const cls = pct>=80?'good':pct>=50?'ok':'bad';
    return `<div class="qcm-hist-item">
      <div class="qhi-left"><h4>QCM ${QCM_BANK[h.cat]?.label||h.cat}</h4><p>${h.date} • ${h.total} questions</p></div>
      <span class="score-badge ${cls}">${h.correct}/${h.total} (${pct}%)</span>
    </div>`;
  }).join('');
}

function launchQCM(cat) {
  const bank = QCM_BANK[cat];
  if (!bank) return;
  qcmState = { questions:shuffled(bank.questions), idx:0, score:0, cat, startTime:Date.now(), timer:null };
  document.getElementById('qcmMenu').style.display = 'none';
  document.getElementById('qcmPlay').style.display = 'block';
  document.getElementById('qcmResult').style.display = 'none';
  setText('qcmTag', bank.label);
  startQCMTimer();
  renderQuestion();
  awardXP(5, '+5 XP');
}

function startQCMTimer() {
  clearInterval(qcmState.timer);
  qcmState.timer = setInterval(()=>{
    const s = Math.floor((Date.now()-qcmState.startTime)/1000);
    setText('qcmTimer', `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`);
  }, 1000);
}

function renderQuestion() {
  const { questions, idx } = qcmState;
  if (idx >= questions.length) { showQCMResult(); return; }
  const q = questions[idx];
  const total = questions.length;
  setText('qcmProg', `${idx+1}/${total}`);
  document.getElementById('qcmProgFill').style.width = `${(idx/total)*100}%`;
  setText('qcmQ', q.q);
  const letters = ['A','B','C','D'];
  document.getElementById('qcmOpts').innerHTML = q.opts.map((o,i)=>
    `<button class="opt" onclick="answerQCM(${i})">
      <span class="opt-letter">${letters[i]}</span>${o}
    </button>`
  ).join('');
  document.getElementById('qcmExp').style.display = 'none';
  document.getElementById('qcmNext').style.display = 'none';
}

function answerQCM(idx) {
  const q = qcmState.questions[qcmState.idx];
  const opts = document.querySelectorAll('#qcmOpts .opt');
  opts.forEach((o,i)=>{
    o.disabled = true;
    if (i===q.a) o.classList.add('correct');
    else if (i===idx) o.classList.add('wrong');
  });
  if (idx===q.a) qcmState.score++;
  const exp = document.getElementById('qcmExp');
  exp.style.display = 'block';
  exp.innerHTML = `<strong>📖 Explication :</strong> ${q.exp}`;
  document.getElementById('qcmNext').style.display = 'inline-flex';
}

function nextQuestion() { qcmState.idx++; renderQuestion(); }

function showQCMResult() {
  clearInterval(qcmState.timer);
  const { score, questions, cat, startTime } = qcmState;
  const total = questions.length;
  const elapsed = Math.floor((Date.now()-startTime)/1000);
  const m = Math.floor(elapsed/60), s = elapsed%60;
  const acc = Math.round(score/total*100);
  const emoji = acc>=80?'🎉':acc>=50?'👍':'📖';
  const title = acc>=80?'Excellent !':acc>=50?'Bien ! Continuez !':'Révisez et réessayez !';
  document.getElementById('qcmPlay').style.display = 'none';
  document.getElementById('qcmResult').style.display = 'block';
  setText('resEmoji', emoji); setText('resTitle', title);
  setText('resScore', `${score}/${total}`); setText('resOK', score);
  setText('resKO', total-score); setText('resAcc', acc+'%');
  setText('resTime', `${m}:${String(s).padStart(2,'0')}`);
  const xp = score*10;
  setText('resXP', xp);
  userData.history = [...(userData.history||[]), { cat, correct:score, total, date:new Date().toLocaleDateString('fr-DZ'), elapsed }];
  userData.qcmSolved = (userData.qcmSolved||0)+total;
  userData.qcmCorrect = (userData.qcmCorrect||0)+score;
  awardXP(xp, `+${xp} XP QCM !`);
  checkAchievements();
  saveToFirestore();
  updateUI();
}

function restartQCM() { launchQCM(qcmState.cat); }
function exitQCM() {
  clearInterval(qcmState.timer);
  document.getElementById('qcmPlay').style.display = 'none';
  document.getElementById('qcmResult').style.display = 'none';
  document.getElementById('qcmMenu').style.display = 'block';
  renderQCMGrid(); renderQCMHistory();
}

// ══════════════════════════════════════════
// EXAMENS
// ══════════════════════════════════════════
function setCfg(type, val, btn) {
  examConfig[type] = val;
  btn.closest('.cfg-btns').querySelectorAll('.cb').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

function renderExamSubjects() {
  const c = document.getElementById('examSubjects');
  if (!c) return;
  c.innerHTML = Object.entries(QCM_BANK).map(([key,cat])=>
    `<div class="exam-sub-card" onclick="launchSubjectExam('${key}')">
      <div class="esc-icon" style="background:${cat.color}22;color:${cat.color}">${cat.icon}</div>
      <div class="esc-info"><h3>${cat.label}</h3><p>${cat.questions.length} questions</p></div>
      <i class="fas fa-arrow-right" style="color:var(--muted)"></i>
    </div>`
  ).join('');
}

function renderExamHistory() {
  const c = document.getElementById('examHistory');
  if (!c) return;
  const hist = (userData.examHistory||[]).slice(-5).reverse();
  if (!hist.length) { c.innerHTML='<p style="color:var(--muted);font-size:14px">Aucun examen passé pour l\'instant. Commencez maintenant ! 🎯</p>'; return; }
  c.innerHTML = hist.map(h=>{
    const cls = h.pct>=80?'good':h.pct>=50?'ok':'bad';
    return `<div class="qcm-hist-item">
      <div class="qhi-left"><h4>${h.title}</h4><p>${h.date} • ${h.total} questions • ${h.timeStr}</p></div>
      <span class="score-badge ${cls}">${h.correct}/${h.total} (${h.pct}%)</span>
    </div>`;
  }).join('');
}

function startRandomExam() {
  let all = [];
  Object.entries(QCM_BANK).forEach(([key,cat])=>cat.questions.forEach(q=>all.push({...q,_cat:key,_catLabel:cat.label})));
  const qs = shuffled(all).slice(0, Math.min(examConfig.q, all.length));
  doLaunchExam(qs, 'Examen Aléatoire', 'random', examConfig.t*60);
}

function launchSubjectExam(key) {
  const cat = QCM_BANK[key];
  if (!cat) return;
  const qs = shuffled(cat.questions).map(q=>({...q,_cat:key,_catLabel:cat.label}));
  doLaunchExam(qs, `Examen — ${cat.label}`, key, 30*60);
}

function doLaunchExam(questions, title, cat, timeSec) {
  examState = { questions, answers:new Array(questions.length).fill(null), idx:0, title, cat, startTime:Date.now(), timerInterval:null, timeLimit:timeSec };
  document.getElementById('examMenu').style.display='none';
  document.getElementById('examPlay').style.display='block';
  document.getElementById('examResult').style.display='none';
  setText('examProg', `1/${questions.length}`);
  startExamTimer();
  renderExamQ();
  renderExamMap();
  awardXP(5,'+5 XP');
}

function startExamTimer() {
  clearInterval(examState.timerInterval);
  examState.timerInterval = setInterval(()=>{
    const elapsed = Math.floor((Date.now()-examState.startTime)/1000);
    const left = examState.timeLimit - elapsed;
    if (left<=0) { clearInterval(examState.timerInterval); showToast('Temps écoulé ! Copie remise automatiquement.','info'); finishExam(); return; }
    const m=Math.floor(left/60), s=left%60;
    setText('examTime', `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    const el=document.getElementById('examTimer');
    if (el) el.classList.toggle('warning', left<120);
  }, 1000);
}

function renderExamQ() {
  const { questions, idx, answers } = examState;
  if (idx>=questions.length) return;
  const q = questions[idx];
  const letters=['A','B','C','D'];
  setText('examProg', `${idx+1}/${questions.length}`);
  document.getElementById('examProgFill').style.width = `${(idx/questions.length)*100}%`;
  setText('examTag', q._catLabel||'');
  setText('examQNum', `Question ${idx+1}`);
  setText('examQ', q.q);
  document.getElementById('examOpts').innerHTML = q.opts.map((o,i)=>`
    <button class="opt ${answers[idx]===i?'selected':''}" onclick="selectExamAns(${i})">
      <span class="opt-letter">${letters[i]}</span>${o}
    </button>`).join('');
  const prev=document.getElementById('examPrev'), next=document.getElementById('examNext'), fin=document.getElementById('examFinish');
  if(prev) prev.style.display = idx>0?'inline-flex':'none';
  if(idx===questions.length-1){ if(next) next.style.display='none'; if(fin) fin.style.display='inline-flex'; }
  else { if(next) next.style.display='inline-flex'; if(fin) fin.style.display='none'; }
}

function selectExamAns(i) {
  examState.answers[examState.idx] = i;
  document.querySelectorAll('#examOpts .opt').forEach((o,j)=>o.classList.toggle('selected',j===i));
  renderExamMap();
}

function examGoTo(i) {
  if (i<0||i>=examState.questions.length) return;
  examState.idx = i;
  renderExamQ();
}

function renderExamMap() {
  const c = document.getElementById('examMap');
  if (!c) return;
  c.innerHTML = examState.questions.map((_,i)=>`
    <div class="em-btn ${examState.answers[i]!==null?'answered':''} ${examState.idx===i?'current':''}" onclick="examGoTo(${i})">${i+1}</div>`).join('');
}

function finishExam() {
  clearInterval(examState.timerInterval);
  const { questions, answers, startTime, title, cat } = examState;
  const elapsed = Math.floor((Date.now()-startTime)/1000);
  const m=Math.floor(elapsed/60), s=elapsed%60;
  const timeStr=`${m}:${String(s).padStart(2,'0')}`;
  let correct=0, wrong=0, skipped=0;
  const corrData=[];
  questions.forEach((q,i)=>{
    const a=answers[i];
    if(a===null){skipped++;corrData.push({q,userAns:null,ok:false});}
    else if(a===q.a){correct++;corrData.push({q,userAns:a,ok:true});}
    else{wrong++;corrData.push({q,userAns:a,ok:false});}
  });
  const pct = Math.round(correct/questions.length*100);
  const mention = getMention(pct);
  const xp = correct*20;
  document.getElementById('examPlay').style.display='none';
  document.getElementById('examResult').style.display='block';
  setText('examResEmoji', mention.emoji);
  setText('examResTitle', `Résultats — ${title}`);
  setText('examScorePct', pct+'%');
  setText('erOK', correct); setText('erKO', wrong); setText('erSkip', skipped); setText('erTime', timeStr);
  setText('erXP', xp);
  const ring = document.getElementById('examScoreRing');
  if (ring) { ring.style.strokeDashoffset = 314-(314*pct/100); ring.style.stroke=pct>=80?'var(--secondary)':pct>=50?'var(--warn)':'var(--accent)'; }
  const mentionEl=document.getElementById('examMention');
  if(mentionEl) mentionEl.innerHTML=`<span style="display:inline-block;padding:8px 24px;border-radius:50px;font-size:16px;font-weight:800;background:${mention.bg};color:${mention.color}">${mention.label}</span>`;
  renderCorrection(corrData);
  awardXP(xp, `+${xp} XP examen !`);
  userData.examHistory = [...(userData.examHistory||[]), { title, cat, total:questions.length, correct, wrong, skipped, pct, date:new Date().toLocaleDateString('fr-DZ'), timeStr }];
  userData.qcmSolved=(userData.qcmSolved||0)+questions.length;
  userData.qcmCorrect=(userData.qcmCorrect||0)+correct;
  checkAchievements(); saveToFirestore(); updateUI();
}

function getMention(pct) {
  if(pct>=90) return {label:'Très Bien ✨',emoji:'🏆',color:'#00D4AA',bg:'rgba(0,212,170,.15)'};
  if(pct>=80) return {label:'Bien 👍',emoji:'🎉',color:'#0066FF',bg:'rgba(0,102,255,.15)'};
  if(pct>=70) return {label:'Assez Bien 📚',emoji:'😊',color:'#FFB800',bg:'rgba(255,184,0,.15)'};
  if(pct>=60) return {label:'Passable 📖',emoji:'💪',color:'#8B5CF6',bg:'rgba(139,92,246,.15)'};
  return {label:'Insuffisant — Révisez ! 📝',emoji:'😤',color:'#FF6B6B',bg:'rgba(255,107,107,.15)'};
}

function renderCorrection(data) {
  const c=document.getElementById('correctionList');
  if(!c) return;
  const letters=['A','B','C','D'];
  c.innerHTML=data.map((item,i)=>{
    const {q,userAns,ok}=item;
    const icon=userAns===null?'➖':ok?'✅':'❌';
    return `<div class="corr-item ${ok?'ok':userAns===null?'skip':'ko'}">
      <div class="corr-head"><span class="corr-n">Q${i+1}</span><span>${icon}</span><p class="corr-q">${q.q}</p></div>
      <div>
        ${!ok&&userAns!==null?`<div class="corr-ans wrong"><i class="fas fa-times"></i> Votre réponse : ${letters[userAns]}. ${q.opts[userAns]}</div>`:''}
        <div class="corr-ans right"><i class="fas fa-check"></i> Bonne réponse : ${letters[q.a]}. ${q.opts[q.a]}</div>
        ${q.exp?`<div class="corr-exp"><i class="fas fa-info-circle" style="color:var(--primary)"></i> ${q.exp}</div>`:''}
      </div>
    </div>`;
  }).join('');
}

function retryExam() {
  if(examState.cat==='random') startRandomExam();
  else launchSubjectExam(examState.cat);
}
function confirmExit() { document.getElementById('confirmOverlay').style.display='flex'; }
function closeConfirm() { document.getElementById('confirmOverlay').style.display='none'; }
function exitExam() {
  clearInterval(examState.timerInterval); closeConfirm();
  document.getElementById('examPlay').style.display='none';
  document.getElementById('examResult').style.display='none';
  document.getElementById('examMenu').style.display='block';
  renderExamSubjects(); renderExamHistory();
}

// ══════════════════════════════════════════
// LIBRARY
// ══════════════════════════════════════════
function renderLibrary(filter) {
  const c=document.getElementById('libGrid');
  if(!c) return;
  const items = filter==='all'?LIBRARY:LIBRARY.filter(i=>i.cat===filter);
  c.innerHTML = items.map(item=>`
    <div class="lib-card" onclick="showToast('Ouverture : ${item.title}','info')">
      <div class="lib-thumb" style="background:var(--bg3)">${item.thumb}</div>
      <div class="lib-body">
        <span class="lib-tag">${item.cat.charAt(0).toUpperCase()+item.cat.slice(1)}</span>
        <h3>${item.title}</h3>
        <p>Année ${item.year}</p>
        <div class="lib-footer">
          <span><i class="fas ${item.type==='video'?'fa-play-circle':'fa-file-pdf'}"></i> ${item.type==='video'?item.duration:item.pages+' pages'}</span>
          <span class="rating">⭐ ${item.rating}</span>
        </div>
      </div>
    </div>`).join('');
}

function filterLib(cat, btn) {
  document.querySelectorAll('.lf').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderLibrary(cat);
}

// ══════════════════════════════════════════
// STATS
// ══════════════════════════════════════════
function renderAchievements() {
  const c=document.getElementById('achievementsGrid');
  if(!c) return;
  const unlocked=getUnlocked();
  c.innerHTML=ACHIEVEMENTS.map(a=>`
    <div class="ach-item ${unlocked.includes(a.key)?'unlocked':'locked'}">
      <div class="ach-icon">${a.icon}</div>
      <h4>${a.title}</h4>
      <p>${a.desc}</p>
    </div>`).join('');
}

function getUnlocked() {
  const u=[];
  if((userData.streak||0)>=7) u.push('streak7');
  if((userData.history||[]).some(h=>h.correct===h.total&&h.total>0)) u.push('perfect');
  if((userData.qcmSolved||0)>=10) u.push('qcm10');
  if((userData.history||[]).some(h=>h.elapsed<180)) u.push('fast');
  if((userData.qcmSolved||0)>=50) u.push('qcm50');
  if((userData.qcmSolved||0)>=100) u.push('qcm100');
  if((userData.level||1)>=10) u.push('level10');
  if((userData.examHistory||[]).length>=5) u.push('exam5');
  if(userData.qcmSolved>0&&Math.round((userData.qcmCorrect/userData.qcmSolved)*100)>=90) u.push('acc90');
  return u;
}

function checkAchievements() {
  const prev=userData.achievements||[];
  const now=getUnlocked();
  now.filter(k=>!prev.includes(k)).forEach(k=>{
    const a=ACHIEVEMENTS.find(x=>x.key===k);
    if(a) showToast(`${a.icon} Récompense débloquée : ${a.title} !`,'success');
  });
  userData.achievements=now;
}

function renderStats() {
  setText('stQCM', userData.qcmSolved||0);
  const acc=userData.qcmSolved>0?Math.round((userData.qcmCorrect/userData.qcmSolved)*100)+'%':'0%';
  setText('stAcc', acc);
  setText('stStr', userData.streak||0);
  setText('stLvl', userData.level||1);
}

function renderChart() {
  const ctx=document.getElementById('statsChart');
  if(!ctx||typeof Chart==='undefined') return;
  if(ctx._chart) { ctx._chart.destroy(); }
  const days=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const hist=userData.history||[];
  const data=days.map((_,i)=>{
    const d=hist.filter(h=>{ try{return new Date(h.date).getDay()===((i+1)%7);}catch(e){return false;} });
    return d.length||Math.floor(Math.random()*6+1);
  });
  ctx._chart=new Chart(ctx,{
    type:'bar',
    data:{
      labels:days,
      datasets:[
        {label:'QCM résolus',data,backgroundColor:'rgba(0,102,255,.6)',borderColor:'#0066FF',borderRadius:8,borderWidth:2},
        {label:'Précision %',data:data.map(d=>Math.min(100,d*15)),type:'line',backgroundColor:'rgba(0,212,170,.1)',borderColor:'#00D4AA',borderRadius:8,borderWidth:2,fill:true,tension:.4,pointBackgroundColor:'#00D4AA'}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{labels:{color:'#8892AA',font:{family:'Sora',size:12}}}},
      scales:{
        y:{beginAtZero:true,grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#8892AA'}},
        x:{grid:{display:false},ticks:{color:'#8892AA'}}
      }
    }
  });
}

// ══════════════════════════════════════════
// XP & GAMIFICATION
// ══════════════════════════════════════════
function awardXP(amount, msg='') {
  userData.xp = (userData.xp||0) + amount;
  userData.level = Math.floor(userData.xp/500)+1;
  updateUI();
  if(msg) {
    const p=document.getElementById('xpPop');
    if(p){ p.textContent='+'+amount+' XP'; p.classList.add('show'); setTimeout(()=>p.classList.remove('show'),1500); }
  }
}

// ══════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════
function showToast(msg, type='info') {
  const c=document.getElementById('toastWrap');
  if(!c) return;
  const icons={success:'fa-check-circle',error:'fa-times-circle',info:'fa-info-circle'};
  const t=document.createElement('div');
  t.className=`toast ${type}`;
  t.innerHTML=`<i class="fas ${icons[type]||'fa-info-circle'}"></i> ${msg}`;
  c.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(120%)'; setTimeout(()=>t.remove(),300); }, 3500);
}

// ══════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════
function shuffled(arr) { return [...arr].sort(()=>Math.random()-.5); }

// Close menu on outside click
document.addEventListener('click', e=>{
  if(!e.target.closest('.nav-right')) toggleMenu(false);
});

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
auth.onAuthStateChanged(user=>{
  if(user) {
    currentUser=user;
    loadUserFromFirestore(user.uid).then(()=>{ showApp(); });
  }
});
