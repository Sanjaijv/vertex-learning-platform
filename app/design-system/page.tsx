import {
  Accessibility, BarChart3, Bell, Bookmark, Check, ChevronDown, ChevronLeft,
  ChevronRight, Clock3, ExternalLink, Eye, FileText, Folder, Grid2X2,
  LockKeyhole, Play, Search, Target, UserRound,
} from "lucide-react";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { VertexLogo, Badge, MetaIcon } from "../components/ui";

export const metadata: Metadata = {
  title: "Vertex Design System",
  description: "The design language for the Vertex learning platform.",
};

const primaryColors = [
  ["Primary 500", "#F97316"], ["Primary 400", "#FB923C"],
  ["Primary 300", "#FDBA74"], ["Primary 200", "#FED7AA"], ["Primary 100", "#FFEEE5"],
];
const neutralColors = [
  ["Neutral 900", "#0F172A"], ["Neutral 700", "#334155"], ["Neutral 500", "#64748B"],
  ["Neutral 300", "#CBD5E1"], ["Neutral 200", "#E2E8F0"], ["Neutral 100", "#F1F5F9"],
  ["Neutral 50", "#FAFAFC"], ["White", "#FFFFFF"],
];
const typeScale = [
  ["Display 1", "Playfair Display", "48 / 56", "Bold", "Page titles"],
  ["Display 2", "Playfair Display", "36 / 44", "Bold", "Section titles"],
  ["Heading 1", "Inter", "28 / 36", "Semi Bold", "Card titles"],
  ["Heading 2", "Inter", "22 / 30", "Semi Bold", "Sub section"],
  ["Heading 3", "Inter", "18 / 26", "Medium", "Small titles"],
  ["Body Large", "Inter", "16 / 24", "Regular", "Body copy"],
  ["Body", "Inter", "14 / 20", "Regular", "Supporting text"],
  ["Small", "Inter", "12 / 16", "Regular", "Captions, meta"],
];
const spacing = [
  ["4", "0.25rem"], ["8", "0.5rem"], ["12", "0.75rem"], ["16", "1rem"],
  ["24", "1.5rem"], ["32", "2rem"], ["40", "2.5rem"], ["48", "3rem"], ["64", "4rem"],
];
const radius = [
  ["4px", "(xs)", "4px"], ["8px", "(sm)", "8px"], ["12px", "(md)", "12px"],
  ["16px", "(lg)", "16px"], ["24px", "(xl)", "24px"], ["Full", "(circle)", "999px"],
];
const iconSet: LucideIcon[] = [Bell, Search, Play, FileText, Bookmark, BarChart3, Clock3, UserRound, ChevronRight];

function SectionHeading({ number, children }: { number: string; children: React.ReactNode }) {
  return <h2 className="section-heading"><span>{number}</span>{children}</h2>;
}

function DotList({ items }: { items: string[] }) {
  return <div className="dot-list">{items.map((item) => <span key={item}>{item}</span>)}</div>;
}

export default function DesignSystemPage() {
  return <main className="design-page">
    <section className="hero-grid panel" aria-labelledby="page-title">
      <div className="intro-block">
        <VertexLogo />
        <h1 id="page-title">Design System</h1>
        <p>A unified design language for Vertex learning platform. Clean, modern and focused on clarity, consistency and intuitive learning experiences.</p>
        <p className="version">VERSION 1.0 <span>•</span> MAY 2025</p>
      </div>
      <div className="colors-block">
        <SectionHeading number="01">Colors</SectionHeading>
        <div className="color-group"><h3>Primary</h3><div className="swatch-grid swatch-grid-primary">
          {primaryColors.map(([name, value]) => <div className="swatch-item" key={name}><div className="swatch" style={{ backgroundColor: value }} /><span>{name}</span><code>{value}</code></div>)}
        </div></div>
        <div className="color-group"><h3>Neutral</h3><div className="swatch-grid swatch-grid-neutral">
          {neutralColors.map(([name, value]) => <div className="swatch-item" key={name}><div className="swatch swatch-bordered" style={{ backgroundColor: value }} /><span>{name}</span><code>{value}</code></div>)}
        </div></div>
      </div>
    </section>

    <div className="two-column type-row">
      <section className="panel typography-panel"><SectionHeading number="02">Typography</SectionHeading>
        <div className="font-sample"><span className="font-glyph font-display">Ag</span><div><h3 className="font-display">Playfair Display</h3><DotList items={["Elegant", "Readable", "Timeless"]} /></div></div>
        <div className="font-sample"><span className="font-glyph">Ag</span><div><h3>Inter</h3><DotList items={["Clean", "Modern", "Highly legible"]} /></div></div>
      </section>
      <section className="panel type-scale-panel"><SectionHeading number="03">Type Scale</SectionHeading><div className="table-scroll"><table>
        <thead><tr><th>Style</th><th>Font</th><th>Size / Line Height</th><th>Weight</th><th>Use</th></tr></thead>
        <tbody>{typeScale.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
      </table></div></section>
    </div>

    <div className="two-column foundations-row">
      <section className="panel spacing-panel"><SectionHeading number="04">Spacing System</SectionHeading><p className="sub-label">Base unit: 4px</p>
        <div className="spacing-scale">{spacing.map(([size, rem]) => <div className="spacing-item" key={size}><div className="spacing-bar" style={{ width: `${size}px`, height: `${size}px` }} /><strong>{size}</strong><span>({rem})</span></div>)}</div>
      </section>
      <section className="panel radius-panel"><SectionHeading number="05">Radius &amp; Shadows</SectionHeading><p className="sub-label">Radius</p>
        <div className="radius-scale">{radius.map(([label, detail, value]) => <div className="radius-item" key={label}><div style={{ borderRadius: value }} /><strong>{label}</strong><span>{detail}</span></div>)}</div>
        <p className="sub-label shadow-label">Shadows</p><div className="shadow-grid">
          <div className="shadow-card shadow-sm"><strong>Sm</strong><span>0 1px 2px 0</span><code>rgba(15, 23, 42, 0.05)</code></div>
          <div className="shadow-card shadow-md"><strong>Md</strong><span>0 4px 12px -2px</span><code>rgba(15, 23, 42, 0.08)</code></div>
          <div className="shadow-card shadow-lg"><strong>Lg</strong><span>0 12px 24px -4px</span><code>rgba(15, 23, 42, 0.10)</code></div>
          <div className="shadow-card shadow-xl"><strong>Xl</strong><span>0 20px 40px -8px</span><code>rgba(15, 23, 42, 0.12)</code></div>
        </div>
      </section>
    </div>

    <div className="component-grid">
      <section className="panel icons-panel"><SectionHeading number="06">Icons</SectionHeading><p className="sub-label">Outline Style</p>
        <div className="icon-row">{iconSet.map((Icon, index) => <Icon key={index} aria-label={`Outline icon ${index + 1}`} />)}</div>
        <p className="sub-label">Filled Style</p><div className="icon-row icon-row-filled">{iconSet.map((Icon, index) => <Icon key={index} aria-label={`Filled icon ${index + 1}`} />)}</div>
        <p className="sub-label icon-specs-title">Icon Specs</p><ul className="spec-list"><li>24×24px grid</li><li>2px stroke width (outline)</li><li>Rounded line caps</li><li>Consistent optical balance</li></ul>
      </section>
      <section className="panel buttons-panel"><SectionHeading number="07">Buttons</SectionHeading><div className="button-table">
        <div className="button-table-head"><span /><span>Primary</span><span>Secondary</span><span>Tertiary</span><span>Text</span></div>
        <div className="button-table-row"><strong>Default</strong><button className="btn btn-primary">Get Started</button><button className="btn btn-secondary">Explore Courses</button><button className="btn btn-tertiary">View Lesson <ExternalLink /></button><button className="btn btn-text">Watch Video <Play /></button></div>
        <div className="button-table-row"><strong>Hover</strong><button className="btn btn-primary is-hover">Get Started</button><button className="btn btn-secondary is-hover">Explore Courses</button><button className="btn btn-tertiary is-hover">View Lesson <ExternalLink /></button><button className="btn btn-text is-hover">Watch Video <Play /></button></div>
        <div className="button-table-row"><strong>Disabled</strong><button className="btn btn-primary" disabled>Get Started</button><button className="btn btn-secondary" disabled>Explore Courses</button><button className="btn btn-tertiary" disabled>View Lesson <ExternalLink /></button><button className="btn btn-text" disabled>Watch Video <Play /></button></div>
      </div><p className="sub-label button-specs-title">Button Specs</p><ul className="spec-list two-col-list"><li>Height: 44px (default)</li><li>Padding: 0 16px (lg), 0 12px (md)</li><li>Radius: 12px</li><li>Font: Inter Medium (14–16px)</li></ul></section>
      <section className="panel inputs-panel"><SectionHeading number="08">Inputs</SectionHeading><label className="field-label" htmlFor="design-search">Search / Text Input</label>
        <div className="input-shell"><Search /><input id="design-search" placeholder="Search anything..." /><kbd>⌘ K</kbd></div>
        <label className="field-label" htmlFor="design-sort">Select</label><div className="select-shell"><select id="design-sort" defaultValue="relevant"><option value="relevant">Most Relevant</option></select><ChevronDown /></div>
        <p className="sub-label field-specs-title">Field Specs</p><ul className="spec-list"><li>Height: 44px</li><li>Radius: 12px</li><li>Border: 1px solid #E2E8F0</li><li>Padding: 0 16px</li><li>Focus: Border color #FB923C</li></ul>
      </section>
    </div>

    <div className="status-grid">
      <section className="panel badges-panel"><SectionHeading number="09">Badges / Tags</SectionHeading><div className="badge-examples"><div><span>Video</span><Badge kind="video">VIDEO</Badge></div><div><span>Lesson</span><Badge kind="lesson">LESSON</Badge></div><div><span>Popular</span><Badge kind="popular">POPULAR</Badge></div></div></section>
      <section className="panel indicators-panel"><SectionHeading number="10">Status / Indicators</SectionHeading><div className="indicator-row"><span><i className="status-progress" />In Progress</span><span><i className="status-complete"><Check /></i>Completed</span><span><i className="status-playing"><Play /></i>Now Playing</span><span><LockKeyhole />Locked</span></div></section>
      <section className="panel progress-panel"><SectionHeading number="11">Progress Bar</SectionHeading><div className="progress-example"><div className="progress-track"><span /></div><strong>35% <em>complete</em></strong></div></section>
    </div>

    <section className="panel cards-panel" id="cards"><SectionHeading number="12">Cards</SectionHeading><div className="cards-grid">
      <div className="card-wrap"><span className="specimen-label">Course Card</span><article className="sample-card course-card"><div className="course-title"><span className="next-mark">N</span><div><h3>Next.js for Production</h3><p>Build scalable, high-performance web applications with Next.js.</p></div></div><div className="card-meta"><MetaIcon icon={BarChart3}>Intermediate</MetaIcon><MetaIcon icon={Clock3}>18h 24m</MetaIcon><MetaIcon icon={Folder}>12 modules</MetaIcon></div></article></div>
      <div className="card-wrap"><span className="specimen-label">Lesson Card (Video)</span><article className="sample-card lesson-video-card"><Badge kind="video">VIDEO</Badge><h3>Data Fetching in Server Components</h3><p>Learn how to fetch data on the server using async/await and Next.js best practices.</p><div className="card-footer"><span>Lesson 5.1 <b>•</b> 12:45</span><a href="#navigation"><Play /> Watch from 12:45</a></div></article></div>
      <div className="card-wrap"><span className="specimen-label">Lesson Card (Lesson)</span><article className="sample-card lesson-card"><Badge kind="lesson">LESSON</Badge><h3>Data Fetching &amp; Caching</h3><p>Explore different data fetching methods in Next.js and how to cache and revalidate data for optimal performance.</p><div className="card-footer"><span>Module 5</span><a href="#navigation">View lesson <ExternalLink /></a></div></article></div>
      <div className="card-wrap"><span className="specimen-label">Resource Card</span><article className="sample-card resource-card"><div className="resource-main"><FileText /><div><h3>Caching and Revalidation Guide</h3><p>Deep dive into Next.js caching strategies.</p></div></div><div className="card-footer"><span>PDF <b>•</b> 1.2 MB</span><a href="#navigation" aria-label="Open resource"><ExternalLink /></a></div></article></div>
    </div></section>

    <section className="panel navigation-panel" id="navigation"><SectionHeading number="13">Navigation</SectionHeading><div className="navigation-grid">
      <nav className="main-nav" aria-label="Design system navigation"><VertexLogo compact /><div><a className="active" href="#page-title">Courses</a><a href="#cards">My Learning</a></div></nav>
      <nav className="breadcrumbs" aria-label="Breadcrumb"><span className="specimen-label">Breadcrumbs</span><div><a href="#page-title">All Courses</a><ChevronRight /><a href="#cards">Next.js for Production</a><ChevronRight /><span>Data Fetching &amp; Caching</span></div></nav>
      <nav className="pagination" aria-label="Pagination"><span className="specimen-label">Pagination</span><div><button aria-label="Previous page"><ChevronLeft /></button><button className="current" aria-current="page">1</button><button>2</button><button>3</button><span>…</span><button>8</button><button aria-label="Next page"><ChevronRight /></button></div></nav>
    </div></section>

    <section className="panel principles-panel"><SectionHeading number="14">Principles</SectionHeading><div className="principles-grid">
      <div className="principle"><Eye /><div><h3>Clarity First</h3><p>Every element should communicate clearly.</p></div></div>
      <div className="principle"><Grid2X2 /><div><h3>Consistency</h3><p>Use components and patterns consistently across the platform.</p></div></div>
      <div className="principle"><Target /><div><h3>Focus &amp; Calm</h3><p>Remove noise and help learners focus on what matters.</p></div></div>
      <div className="principle"><Accessibility /><div><h3>Accessible</h3><p>Design with accessibility and inclusivity in mind.</p></div></div>
    </div></section>
  </main>;
}
