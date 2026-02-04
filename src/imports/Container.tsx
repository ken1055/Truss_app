import svgPaths from "./svg-u7k8r9dq17";

function Icon() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p25397b80} id="Vector" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2c4f400} id="Vector_2" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2241fff0} id="Vector_3" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.pc9c280} id="Vector_4" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="basis-0 grow h-[24px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[24px] left-[47px] not-italic text-[#3d3d4e] text-[16px] text-center text-nowrap top-[-0.5px] tracking-[-0.3125px] translate-x-[-50%]">メンバー（26）</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[50px] relative shrink-0 w-[154.406px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#3d3d4e] border-[0px_0px_2px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center pb-[2px] pt-0 px-[16px] relative size-full">
        <Icon />
        <Text />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_2006_3826)" id="Icon">
          <path d={svgPaths.p29da0700} id="Vector" stroke="var(--stroke-0, #6B6B7A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p3fe63d80} id="Vector_2" stroke="var(--stroke-0, #6B6B7A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
        <defs>
          <clipPath id="clip0_2006_3826">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text1() {
  return (
    <div className="basis-0 grow h-[24px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[24px] left-[32px] not-italic text-[#6b6b7a] text-[16px] text-center text-nowrap top-[-0.5px] tracking-[-0.3125px] translate-x-[-50%]">承認待ち</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[50px] relative shrink-0 w-[124px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[16px] py-0 relative size-full">
        <Icon1 />
        <Text1 />
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex gap-[8px] items-start pb-px pt-0 px-0 relative size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Button />
      <Button1 />
    </div>
  );
}