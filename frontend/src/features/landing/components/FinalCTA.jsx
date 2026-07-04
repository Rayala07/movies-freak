import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RiPlayFill, RiSparklingFill } from "@remixicon/react";

const FinalCTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden px-8 py-16 sm:px-16 sm:py-20 text-center"
          style={{
            background: "linear-gradient(135deg, #4c1d95 0%, #6d28d9 45%, #7c3aed 100%)",
          }}
        >
          {/* Decorative glow blobs */}
          <div
            className="aurora-blob absolute rounded-full pointer-events-none"
            style={{ width: 420, height: 420, top: "-20%", left: "-10%", background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)", filter: "blur(10px)" }}
          />
          <div
            className="aurora-blob absolute rounded-full pointer-events-none"
            style={{ width: 380, height: 380, bottom: "-25%", right: "-8%", background: "radial-gradient(circle, rgba(192,132,252,0.3) 0%, transparent 70%)", filter: "blur(10px)", animationDelay: "-8s" }}
          />
          <div className="absolute inset-0 grain-overlay pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 bg-white/10 border border-white/20 text-white backdrop-blur-sm">
              <RiSparklingFill size={13} />
              Your next favorite movie is one vibe away
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Ready to stop scrolling <br className="hidden sm:block" />
              and start watching?
            </h2>
            <p className="text-white/75 text-base sm:text-lg max-w-xl mx-auto mb-10">
              Join Kineo free and let AI curate a cinema experience built entirely around your taste.
            </p>

            <Link to="/register">
              <motion.button
                whileHover={{ y: -4, scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full text-sm font-bold cursor-pointer border-0 bg-white text-[#6d28d9] shadow-2xl"
              >
                <RiPlayFill size={18} />
                Get Started — It's Free
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
