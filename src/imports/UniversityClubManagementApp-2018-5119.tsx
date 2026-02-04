import svgPaths from "./svg-yr9efvzyem";

function Button() {
  return (
    <div className="bg-[#3d3d4e] h-[31.991px] relative rounded-[8px] shrink-0 w-[71.804px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[12px] py-0 relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] text-center text-nowrap tracking-[-0.1504px]">English</p>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex h-[85px] items-start justify-end px-[16px] py-[28px] relative shrink-0 w-[399px]" data-name="Header">
      <Button />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[31.991px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31.9911 31.9911">
        <g id="Icon">
          <path d={svgPaths.p881dc80} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66593" />
        </g>
      </svg>
    </div>
  );
}

function EmailVerification() {
  return (
    <div className="absolute bg-[#49b1e4] content-stretch flex items-center justify-center left-[167.77px] pl-0 pr-[0.01px] py-0 rounded-[2.22764e+07px] size-[63.993px] top-[24.66px]" data-name="EmailVerification">
      <Icon />
    </div>
  );
}

function CardTitle() {
  return (
    <div className="absolute h-[15.996px] left-[24.66px] top-[110.64px] w-[350.222px]" data-name="CardTitle">
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[16px] left-[175.11px] not-italic text-[#3d3d4e] text-[16px] text-center text-nowrap top-[-0.33px] tracking-[-0.3125px] translate-x-[-50%]">認証完了</p>
    </div>
  );
}

function CardDescription() {
  return <div className="absolute h-[23.993px] left-[24.66px] top-[132.63px] w-[350.222px]" data-name="CardDescription" />;
}

function Button1() {
  return (
    <div className="absolute bg-[#49b1e4] h-[35.995px] left-[24.66px] rounded-[8px] top-[180.62px] w-[350.222px]" data-name="Button">
      <p className="absolute font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] left-[175.11px] not-italic text-[#f5f1e8] text-[14px] text-center text-nowrap top-[8.99px] tracking-[-0.1504px] translate-x-[-50%]">次へ</p>
    </div>
  );
}

function Card() {
  return (
    <div className="bg-[#f5f1e8] h-[241.272px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <EmailVerification />
      <CardTitle />
      <CardDescription />
      <Button1 />
    </div>
  );
}

export default function UniversityClubManagementApp() {
  return (
    <div className="bg-[#f5f1e8] content-stretch flex flex-col gap-[196px] items-start pb-0 pt-[3px] px-[15.996px] relative size-full" data-name="University Club Management App">
      <Header />
      <Card />
    </div>
  );
}