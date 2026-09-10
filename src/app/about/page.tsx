import { images } from "@/lib/images";
import Image from "next/image";
import { BulletList, ButtonLink, Callout, Card, SectionHeading } from "@/components/ui";

export const metadata = { title: "About" };

const values = [
  { title: "Student first", detail: "Every screen is judged by one question: does this help the student make a better-informed decision?" },
  { title: "Trust and integrity", detail: "We show sources and verification dates, and we say plainly when we don't know." },
  { title: "Inclusivity", detail: "Diploma, vocational and trade routes are presented as legitimate, not as fallbacks." },
  { title: "Continuous learning", detail: "Guidance improves as data improves — and students can flag anything that looks wrong." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-ink-100 bg-white">
        <div className="cb-container grid gap-8 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <SectionHeading
            eyebrow="About"
            title="About CareerBridge"
            description="We're here to help students in Nagaland explore, understand and plan their future with confidence — starting from where they actually are."
          />
          <div className="overflow-hidden rounded-2xl border border-ink-100">
            <Image src={images.studentsTogether} alt="Students on a campus in Nagaland" width={900} height={600} className="h-60 w-full object-cover" />
          </div>
        </div>
      </section>

      <div className="cb-container py-14">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink-900">Our mission</h2>
            <p className="mt-2 text-sm text-ink-500">
              To provide trusted, accessible and personalised career and education guidance for every student in
              Nagaland — regardless of district, school or background.
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink-900">Our vision</h2>
            <p className="mt-2 text-sm text-ink-500">
              A future where every student can make informed choices and reach their full potential, having genuinely
              understood the options in front of them.
            </p>
          </Card>
        </div>

        <h2 className="mt-12 text-lg font-semibold">What we stand for</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <Card key={value.title} className="p-5">
              <p className="text-sm font-semibold text-ink-900">{value.title}</p>
              <p className="mt-1.5 text-sm text-ink-500">{value.detail}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink-900">What CareerBridge is not</h2>
            <div className="mt-3">
              <BulletList
                items={[
                  "It is not a career prediction system — it does not decide your future from your marks",
                  "It is not an admission agent, and it never promises a seat",
                  "It does not publish fees, deadlines or eligibility rules it cannot source",
                  "It does not rank students or compare you against others",
                ]}
              />
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink-900">Privacy for young people</h2>
            <div className="mt-3">
              <BulletList
                items={[
                  "We ask only for what guidance needs — no address, no income figures, no phone number",
                  "Location is used at district or town level only",
                  "Your answers are yours: edit or clear them at any time",
                  "Everything you tell us is treated as student-provided information, never as verified fact",
                ]}
              />
            </div>
          </Card>
        </div>

        <div className="mt-10 max-w-3xl">
          <Callout tone="forest" title="Different backgrounds. Different dreams. One shared future.">
            <p>
              CareerBridge V1 covers Nagaland. The data model already supports country → state → district → city, so
              other states can be added without rebuilding the platform.
            </p>
          </Callout>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/start">Start exploring</ButtonLink>
          <ButtonLink href="/admin" variant="secondary">
            Data &amp; verification status
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
