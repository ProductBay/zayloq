import {
  AppWindow,
  CalendarDays,
  Globe2,
  LayoutDashboard,
  PanelsTopLeft,
  ShoppingCart,
  Store,
} from "lucide-react";

const builds = [
  {
    title: "Websites",
    description: "Premium business websites and digital experiences.",
    icon: Globe2,
  },
  {
    title: "Online Stores",
    description: "Products, inventory, checkout, orders and customers.",
    icon: ShoppingCart,
  },
  {
    title: "Web Apps",
    description: "Dashboards, portals, workflows and business platforms.",
    icon: AppWindow,
  },
  {
    title: "Mobile Apps",
    description: "Modern experiences for Android and iOS.",
    icon: PanelsTopLeft,
  },
  {
    title: "SaaS",
    description: "Subscriptions, teams, authentication and billing.",
    icon: LayoutDashboard,
  },
  {
    title: "Marketplaces",
    description: "Connect sellers, buyers, services and transactions.",
    icon: Store,
  },
  {
    title: "Booking Platforms",
    description: "Availability, reservations, payments and automation.",
    icon: CalendarDays,
  },
];

export function BuildTypesSection() {
  return (
    <section id="build" className="mx-auto max-w-7xl px-5 py-28">

      <div className="max-w-3xl">
        <div className="text-xs font-black uppercase tracking-[0.35em] text-[#00D4C6]">
          What will you build?
        </div>

        <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] md:text-6xl">
          One platform.
          <br />
          <span className="text-white/30">
            A world of possibilities.
          </span>
        </h2>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

        {builds.map(({ title, description, icon: Icon }, index) => (
          <article
            key={title}
            className={`z-glass min-h-[230px] rounded-[28px] p-7 transition hover:-translate-y-1 hover:border-[#00D4C6]/30 ${
              index === 0 || index === 3
                ? "lg:col-span-2"
                : ""
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#00D4C6]">
              <Icon size={22} />
            </div>

            <h3 className="mt-14 text-2xl font-black">
              {title}
            </h3>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/45">
              {description}
            </p>
          </article>
        ))}

      </div>

    </section>
  );
}
