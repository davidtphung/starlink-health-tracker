import type { FunFact } from "@shared/types";
import {
  Scale,
  Clock,
  Mountain,
  Rocket,
  Repeat,
  Zap,
  Globe,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  facts: FunFact[];
}

const iconMap: Record<string, typeof Scale> = {
  scale: Scale,
  clock: Clock,
  mountain: Mountain,
  rocket: Rocket,
  repeat: Repeat,
  zap: Zap,
  globe: Globe,
  layers: Layers,
};

export function FunFactsSection({ facts }: Props) {
  return (
    <section className="mt-phi-6" role="region" aria-label="Fun facts and statistics">
      <h3 className="text-sm font-mono text-gray-400 tracking-wider mb-phi-5 uppercase flex items-center gap-phi-2">
        <Zap className="w-4 h-4 text-spacex-gold" aria-hidden="true" />
        Fun Facts &amp; Stats
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-phi-4">
        {facts.map((fact, i) => {
          const Icon = iconMap[fact.icon] || Zap;
          return (
            <motion.div
              key={fact.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="glass rounded-xl p-phi-5 hover:border-spacex-gold/30 transition-colors group"
            >
              <Icon
                className="w-5 h-5 text-spacex-gold mb-phi-3 group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
              <p className="text-xs text-gray-500 font-mono tracking-wider mb-phi-1">
                {fact.label}
              </p>
              <p className="text-xl font-bold text-white mb-phi-1">{fact.value}</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {fact.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
