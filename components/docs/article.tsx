export type DocBlock = {
  id: string;
  kicker: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  rows?: [string, string][];
};

export function DocArticle({ sections }: { sections: DocBlock[] }) {
  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        const light = index % 2 === 0;
        return (
          <section
            id={section.id}
            key={section.id}
            className={`scroll-mt-24 rounded-[28px] p-7 sm:p-10 ${light ? 'bg-[#F7FAF8] text-[#102019]' : 'border border-white/10 bg-[#0D211A] text-[#E7F3EC]'}`}
          >
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${light ? 'text-[#087A50]' : 'text-[#70FFB8]'}`}>{section.kicker}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className={`mt-4 leading-8 ${light ? 'text-[#52635C]' : 'text-[#C3D1CB]'}`}>
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className={`mt-5 list-disc space-y-2 pl-5 text-sm leading-7 ${light ? 'text-[#3E524A]' : 'text-[#C3D1CB]'}`}>
                {section.bullets.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : null}
            {section.rows ? (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <tbody>
                    {section.rows.map(([label, value]) => (
                      <tr key={label} className={light ? 'border-t border-[#DDE7E1]' : 'border-t border-white/10'}>
                        <th className="w-[34%] py-3 pr-4 align-top font-semibold">{label}</th>
                        <td className={`py-3 align-top leading-6 ${light ? 'text-[#52635C]' : 'text-[#C3D1CB]'}`}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
