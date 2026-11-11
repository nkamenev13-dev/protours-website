import { email } from './content.mjs';

const contact = `<a href="mailto:${email}">${email}</a>`;
const address = '73 rue du Château, 92100 Boulogne-Billancourt, France';
const cnil = '<a href="https://www.cnil.fr/fr/adresser-une-plainte">CNIL</a>';

export const privacy = {
  en: {
    title: 'Privacy Policy',
    updated: 'Effective date: 11 November 2026',
    description: 'How LG-Platform handles personal data for ProTours enquiries and bookings.',
    intro: 'LG-Platform SARL, operating as ProTours, is the data controller for enquiries and bookings submitted through ProTours.',
    sections: [
      ['1. Data we collect', '<p>We collect the lead traveller’s name, phone number and email address, the requested tour or itinerary, the preferred travel date and any agreed travel time, and the number of travellers. Additional comments are optional. We need the required information to respond to your request and arrange the service.</p>'],
      ['2. How we use your data', '<p>We use this information to respond to enquiries, prepare quotes, manage bookings, contact you about your trip and coordinate the requested service. The legal basis is taking steps at your request before entering into a contract and performing that contract. We also process records as necessary to meet legal and accounting obligations. We do not sell or share your booking data for marketing purposes.</p>'],
      ['3. Who receives your data', '<p>Where necessary to deliver the service, we share relevant details with the guides, drivers or transport partners involved in your booking. Our email provider handles booking correspondence. The website opens an email draft for you to send and does not take payments directly. Payment arrangements, where applicable, are handled separately.</p>'],
      ['4. How long we keep your data', '<p>We keep the data for as long as needed to handle your request and provide the service, then for any period required by applicable legal, accounting or regulatory obligations.</p>'],
      ['5. Your rights', `<p>Where applicable, you may request access, correction, deletion, restriction or portability of your data, or object to its processing. To exercise your rights, email ${contact}. You may also lodge a complaint with the ${cnil} or another competent supervisory authority.</p>`],
      ['6. Data security', '<p>We use appropriate technical and organisational measures to protect personal data against unauthorised access, misuse, loss or destruction.</p>'],
      ['7. Changes to this policy', '<p>We publish changes to this policy here with the updated effective date.</p>'],
      ['8. Contact', `<p>LG-Platform SARL · ProTours<br>${address}<br>SIREN 949 853 394<br>${contact}</p>`],
    ],
  },
  fr: {
    title: 'Politique de confidentialité',
    updated: 'Date d’entrée en vigueur : 11 novembre 2026',
    description: 'Comment LG-Platform traite les données personnelles liées aux demandes et réservations ProTours.',
    intro: 'LG-Platform SARL, qui exerce sous la marque ProTours, est responsable du traitement des données liées aux demandes et aux réservations ProTours.',
    sections: [
      ['1. Données collectées', '<p>Nous recueillons le nom, le numéro de téléphone et l’adresse e-mail du voyageur principal, l’excursion ou l’itinéraire souhaité, la date de voyage et l’horaire convenu le cas échéant, ainsi que le nombre de voyageurs. Les commentaires sont facultatifs. Les renseignements obligatoires nous permettent de répondre à votre demande et d’organiser la prestation.</p>'],
      ['2. Utilisation des données', '<p>Nous utilisons ces données pour répondre à vos demandes, préparer les devis, gérer les réservations, vous contacter au sujet de votre voyage et coordonner la prestation. Le traitement repose sur les mesures précontractuelles prises à votre demande et sur l’exécution du contrat. Nous traitons également les documents nécessaires au respect de nos obligations légales et comptables. Nous ne vendons ni ne partageons les données de réservation à des fins de marketing.</p>'],
      ['3. Destinataires des données', '<p>Lorsque la prestation le nécessite, nous transmettons les renseignements utiles aux guides, chauffeurs ou partenaires de transport concernés. Notre prestataire de messagerie traite les échanges liés aux réservations. Le site ouvre un brouillon d’e-mail que vous pouvez envoyer et n’encaisse pas de paiements directement. Les modalités de paiement sont traitées séparément, le cas échéant.</p>'],
      ['4. Durée de conservation', '<p>Nous conservons les données le temps nécessaire au traitement de votre demande et à la réalisation de la prestation, puis pendant la durée imposée par les obligations légales, comptables ou réglementaires applicables.</p>'],
      ['5. Vos droits', `<p>Selon les conditions applicables, vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou la portabilité de vos données, ou vous opposer à leur traitement. Pour exercer vos droits, écrivez à ${contact}. Vous pouvez également adresser une réclamation à la ${cnil} ou à une autre autorité de contrôle compétente.</p>`],
      ['6. Sécurité des données', '<p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger les données contre l’accès non autorisé, l’utilisation abusive, la perte ou la destruction.</p>'],
      ['7. Modifications de cette politique', '<p>Nous publions ici les modifications de cette politique avec la nouvelle date d’entrée en vigueur.</p>'],
      ['8. Contact', `<p>LG-Platform SARL · ProTours<br>${address}<br>SIREN 949 853 394<br>${contact}</p>`],
    ],
  },
};
