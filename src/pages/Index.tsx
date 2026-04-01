import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Users, Shield, ArrowRight, Star, Globe, TrendingUp, ChevronDown, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
});

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.15 } },
  viewport: { once: true },
};

const staggerChild = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

export default function Index() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero */}
      <header className="relative min-h-screen flex flex-col">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-secondary/8" />
        <div className="absolute top-20 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 -right-32 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
        <motion.div
          className="absolute top-1/4 right-1/4 w-3 h-3 rounded-full bg-secondary/40"
          animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 left-1/5 w-2 h-2 rounded-full bg-primary/30"
          animate={{ y: [0, 15, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/5 w-4 h-4 rounded-full bg-secondary/20"
          animate={{ y: [0, -25, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Nav */}
        <motion.nav
          className="relative container mx-auto px-4 py-6 flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <span className="text-primary-foreground font-display font-bold text-lg">M</span>
            </motion.div>
            <span className="font-display font-bold text-xl text-foreground">
              Partenaire <span className="text-secondary">MAGB</span>
            </span>
          </div>
          <div className="flex gap-2">
            <Link to="/login"><Button variant="ghost" className="font-medium">Connexion</Button></Link>
            <Link to="/signup"><Button className="font-medium shadow-md">S'inscrire</Button></Link>
          </div>
        </motion.nav>

        {/* Hero content */}
        <div className="relative flex-1 flex items-center justify-center">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-8"
            >
              <Star className="w-4 h-4" />
              Rejoignez plus de 500 partenaires
            </motion.div>

            <motion.h1
              className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            >
              Devenez partenaire du{' '}
              <span className="relative">
                <span className="text-secondary">Ministère d'Adoration</span>
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-1 bg-secondary/30 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  style={{ originX: 0 }}
                />
              </span>{' '}
              Geneviève Brou
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Contribuez à l'avancement de l'œuvre de Dieu à travers vos dons
              et suivez votre engagement spirituel en temps réel.
            </motion.p>

            <motion.div
              className="flex gap-4 justify-center flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Link to="/signup">
                <Button size="lg" className="gap-2 text-base px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
                  Commencer maintenant <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-base px-8 py-6">
                  J'ai déjà un compte
                </Button>
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="flex items-center justify-center gap-8 sm:gap-12 mt-16 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {[
                { value: '500+', label: 'Partenaires' },
                { value: '15M+', label: 'FCFA collectés' },
                { value: '12', label: 'Pays' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="font-display text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground/50" />
        </motion.div>
      </header>

      {/* Features */}
      <section className="relative py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeUp()}>
            <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-3">Pourquoi nous rejoindre</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Une plateforme pensée pour vous
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Tout ce dont vous avez besoin pour contribuer facilement et suivre votre impact.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" {...staggerContainer}>
            {[
              { icon: Heart, title: 'Dons sécurisés', desc: 'Effectuez vos contributions en toute sécurité, ponctuellement ou de manière récurrente.', color: 'bg-destructive/10 text-destructive' },
              { icon: Users, title: 'Communauté mondiale', desc: 'Rejoignez une communauté de partenaires engagés à travers le monde entier.', color: 'bg-primary/10 text-primary' },
              { icon: Shield, title: 'Suivi transparent', desc: 'Suivez vos engagements, historique de paiements et votre progression en temps réel.', color: 'bg-secondary/15 text-secondary' },
            ].map((f, i) => (
              <motion.div
                key={i}
                className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl"
                {...staggerChild}
                whileHover={{ y: -4 }}
              >
                <div className={`w-14 h-14 rounded-xl ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeUp()}>
            <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-3">Comment ça marche</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Simple comme 1, 2, 3
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Créez votre compte', desc: 'Inscrivez-vous en quelques secondes avec vos informations de base.' },
              { step: '02', title: 'Choisissez votre don', desc: 'Sélectionnez le montant et la fréquence de votre contribution.' },
              { step: '03', title: 'Suivez votre impact', desc: 'Consultez votre tableau de bord et voyez votre progression.' },
            ].map((s, i) => (
              <motion.div key={i} className="relative text-center" {...fadeUp(i * 0.15)}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-5">
                  <span className="font-display text-2xl font-bold text-primary">{s.step}</span>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border" />
                )}
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact section */}
      <section className="py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <motion.div {...fadeUp()}>
              <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-3">Votre impact</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Chaque don compte et fait la différence
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Grâce à votre générosité, le Ministère d'Adoration Geneviève Brou peut continuer
                à toucher des vies, organiser des événements et porter l'œuvre de Dieu à travers le monde.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Globe, text: 'Rayonnement dans 12 pays à travers le monde' },
                  { icon: TrendingUp, text: 'Croissance continue grâce à vos contributions' },
                  { icon: Heart, text: 'Des milliers de vies transformées chaque année' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border"
                    {...fadeUp(i * 0.1)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-secondary" />
                    </div>
                    <p className="text-foreground font-medium text-sm">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4"
              {...fadeUp(0.2)}
            >
              {[
                { value: '500+', label: 'Partenaires actifs', bg: 'bg-primary text-primary-foreground' },
                { value: '15M+', label: 'FCFA collectés', bg: 'bg-secondary text-secondary-foreground' },
                { value: '98%', label: 'Taux de satisfaction', bg: 'bg-card border border-border text-foreground' },
                { value: '24/7', label: 'Accès à votre espace', bg: 'bg-card border border-border text-foreground' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className={`p-6 rounded-2xl ${stat.bg} text-center`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <p className="font-display text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm opacity-80">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeUp()}>
            <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-3">Témoignages</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ce que disent nos partenaires
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Découvrez les expériences de ceux qui ont rejoint la communauté.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto" {...staggerContainer}>
            {[
              {
                name: 'Marie-Claire K.',
                role: 'Partenaire Or',
                location: "Abidjan, Côte d'Ivoire",
                text: "Être partenaire du MAGB a transformé ma vie spirituelle. La plateforme rend le suivi de mes dons tellement simple et transparent.",
                initials: 'MK',
                badgeColor: 'bg-secondary text-secondary-foreground',
              },
              {
                name: 'Jean-Baptiste M.',
                role: 'Partenaire Bronze',
                location: 'Paris, France',
                text: "Depuis la diaspora, je peux contribuer facilement à l'œuvre. Le système de gamification me motive à être régulier dans mes dons.",
                initials: 'JM',
                badgeColor: 'bg-gold-dark text-card',
              },
              {
                name: 'Esther N.',
                role: 'Partenaire Argent',
                location: 'Douala, Cameroun',
                text: "La transparence du suivi des contributions est remarquable. Je sais exactement où va chaque franc et ça me donne confiance.",
                initials: 'EN',
                badgeColor: 'bg-muted-foreground text-card',
              },
              {
                name: 'Patrick A.',
                role: 'Partenaire Bronze',
                location: 'Lomé, Togo',
                text: "L'interface est intuitive et les notifications me rappellent mes engagements. C'est devenu un rendez-vous spirituel pour moi.",
                initials: 'PA',
                badgeColor: 'bg-gold-dark text-card',
              },
              {
                name: 'Grace O.',
                role: 'Partenaire Or',
                location: 'Montréal, Canada',
                text: "Le reçu de paiement automatique et le tableau de bord sont des outils formidables. Je recommande à tous les frères et sœurs.",
                initials: 'GO',
                badgeColor: 'bg-secondary text-secondary-foreground',
              },
              {
                name: 'Samuel T.',
                role: 'Partenaire Classique',
                location: 'Dakar, Sénégal',
                text: "J'ai commencé modestement mais chaque don compte. La progression vers le niveau Bronze me motive énormément !",
                initials: 'ST',
                badgeColor: 'bg-muted text-muted-foreground',
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg flex flex-col"
                {...staggerChild}
                whileHover={{ y: -4 }}
              >
                <Quote className="w-8 h-8 text-secondary/20 mb-4" />
                <p className="text-foreground leading-relaxed flex-1 mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="font-display font-bold text-primary text-sm">{t.initials}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${t.badgeColor}`}>
                    {t.role.replace('Partenaire ', '')}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gamification levels */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div className="text-center mb-16" {...fadeUp()}>
            <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-3">Programme de fidélité</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Progressez à chaque don
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Plus vous donnez, plus vous montez en niveau. Atteignez le statut Or et devenez un partenaire d'excellence.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" {...staggerContainer}>
            {[
              { name: 'Classique', range: '0 – 300K', color: 'border-border bg-muted/50', badge: 'bg-muted text-muted-foreground' },
              { name: 'Bronze', range: '300K – 1M', color: 'border-gold-dark/30 bg-gold-dark/5', badge: 'bg-gold-dark text-card' },
              { name: 'Argent', range: '1M – 10M', color: 'border-muted-foreground/30 bg-muted-foreground/5', badge: 'bg-muted-foreground text-card' },
              { name: 'Or', range: '10M+', color: 'border-secondary/30 bg-secondary/5', badge: 'bg-secondary text-secondary-foreground' },
            ].map((l, i) => (
              <motion.div
                key={i}
                className={`relative p-6 rounded-2xl border-2 ${l.color} text-center`}
                {...staggerChild}
                whileHover={{ y: -4 }}
              >
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${l.badge} mb-4`}>
                  {l.name}
                </div>
                <p className="font-display text-lg font-bold text-foreground mb-1">{l.range}</p>
                <p className="text-xs text-muted-foreground">FCFA de contributions</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <motion.div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-secondary/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="relative container mx-auto px-4 text-center max-w-2xl">
          <motion.div {...fadeUp()}>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
              Prêt à faire la différence ?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-10 leading-relaxed">
              Rejoignez la communauté de partenaires du MAGB et commencez à impacter des vies dès aujourd'hui.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="gap-2 text-base px-8 py-6 shadow-lg">
                  Devenir partenaire <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-base px-8 py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Se connecter
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-sm">M</span>
              </div>
              <span className="font-display font-bold text-foreground">
                Partenaire <span className="text-secondary">MAGB</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Ministère d'Adoration Geneviève Brou — Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
