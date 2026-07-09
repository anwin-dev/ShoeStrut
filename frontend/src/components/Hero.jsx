import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import './Hero.css';

const SLIDES = [
  {
    kicker: 'New Season 2026',
    title: 'Step Into Luxury',
    subtitle: 'Premium footwear crafted for movement, presence, and everyday elegance.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1920&q=80',
    cta: 'Shop Now',
    ctaLink: '/shop',
    secondary: 'Explore Collection',
    secondaryLink: '/shop?sort=New newArrivals',
  },
  {
    kicker: 'Limited Edition',
    title: 'Designed To Move',
    subtitle: 'Engineered comfort meets bold silhouettes — built for the streets and beyond.',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1920&q=80',
    cta: 'Shop Now',
    ctaLink: '/shop',
    secondary: 'Explore Collection',
    secondaryLink: '/shop',
  },
  {
    kicker: 'StepStyle Edit',
    title: 'Elevate Every Step',
    subtitle: 'Discover curated collections with exclusive offers and fast delivery.',
    image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa0?auto=format&fit=crop&w=1920&q=80',
    cta: 'Shop Now',
    ctaLink: '/shop',
    secondary: 'Explore Collection',
    secondaryLink: '/shop?sort=Featured',
  },
];

const Hero = () => {
  const [index, setIndex] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 12,
    });
  };

  const slide = SLIDES[index];

  return (
    <section className="hero-premium" onMouseMove={onMouseMove}>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.image}
          className="hero-slide-bg"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            transform: `translate(${mouse.x * 0.3}px, ${mouse.y * 0.3}px) scale(1.05)`,
          }}
        >
          <img src={slide.image} alt="" />
          <div className="hero-overlay" />
        </motion.div>
      </AnimatePresence>

      <div className="hero-float-orb" aria-hidden="true" />
      <div className="hero-float-orb hero-float-orb-2" aria-hidden="true" />

      <div className="container hero-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="hero-copy"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="hero-kicker">{slide.kicker}</p>
            <h1>{slide.title}</h1>
            <p className="hero-sub">{slide.subtitle}</p>
            <div className="hero-cta">
              <Link to={slide.ctaLink} className="btn btn-accent">
                {slide.cta} <ArrowRight size={18} />
              </Link>
              <Link to={slide.secondaryLink} className="btn btn-outline hero-btn-outline">
                {slide.secondary}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="hero-dots" role="tablist" aria-label="Hero slides">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              className={`hero-dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="hero-scroll"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        aria-hidden="true"
      >
        <ChevronDown size={20} />
      </motion.div>
    </section>
  );
};

export default Hero;
