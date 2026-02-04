import svgPaths from "./svg-rtnoyuv681";

function PrimitiveH() {
  return (
    <div className="h-[18px] relative shrink-0 w-[462px]" data-name="Primitive.h2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] left-0 not-italic text-[#3d3d4e] text-[18px] text-nowrap top-0 tracking-[-0.4395px]">山田太郎</p>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#101828] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px]">ヤマダタロウ</p>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[44px] relative shrink-0 w-[223px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Paragraph />
      </div>
    </div>
  );
}

function PrimitiveP() {
  return <div className="basis-0 grow min-h-px min-w-px shrink-0 w-[462px]" data-name="Primitive.p" />;
}

function DialogHeader() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[46px] items-start left-[24px] top-[24px] w-[107px]" data-name="DialogHeader">
      <PrimitiveH />
      <Container />
      <PrimitiveP />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">学生番号</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#101828] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px]">1234567A</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[44px] items-start left-0 top-[76px] w-[223px]" data-name="Container">
      <Paragraph1 />
      <Paragraph2 />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="absolute h-[20px] left-[253px] top-[17px] w-[223px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">生年月日</p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">メールアドレス</p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#101828] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px]">a@ac.jp</p>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex flex-col h-[44px] items-start left-0 top-[17px] w-[223px]" data-name="Container">
      <Paragraph4 />
      <Paragraph5 />
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="absolute h-[20px] left-0 top-[193px] w-[223px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">生まれた国</p>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[223px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">区分</p>
    </div>
  );
}

function Badge() {
  return (
    <div className="absolute bg-[#dbeafe] border border-[rgba(0,0,0,0)] border-solid h-[22px] left-0 overflow-clip rounded-[8px] top-[22.5px] w-[138px]" data-name="Badge">
      <p className="absolute font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[16px] left-[8px] not-italic text-[#193cb8] text-[12px] text-nowrap top-[3px]">日本人学生・国内学生</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute h-[44.5px] left-0 top-[129px] w-[223px]" data-name="Container">
      <Paragraph7 />
      <Badge />
    </div>
  );
}

function Paragraph8() {
  return <div className="absolute h-[20px] left-0 top-[240.5px] w-[462px]" data-name="Paragraph" />;
}

function Paragraph9() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">学部学科</p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#101828] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px]">理学部 物理学科</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex flex-col h-[44px] items-start left-[253px] top-[75px] w-[223px]" data-name="Container">
      <Paragraph9 />
      <Paragraph10 />
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">学年</p>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#101828] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px]">3</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex flex-col h-[44px] items-start left-[257px] top-[134px] w-[223px]" data-name="Container">
      <Paragraph11 />
      <Paragraph12 />
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[241px] relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Paragraph3 />
      <Container2 />
      <Paragraph6 />
      <Container3 />
      <Paragraph8 />
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] left-[257px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[193px] tracking-[-0.1504px]">話せる言語</p>
      <Container4 />
      <Container5 />
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute content-stretch flex flex-col h-[230px] items-start left-0 top-[43px] w-[462px]" data-name="Container">
      <Container6 />
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="absolute h-[20px] left-0 top-[11px] w-[223px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">ニックネーム</p>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[69.5px] size-[16px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_2006_5082)" id="Icon">
          <path d={svgPaths.p3bd56180} id="Vector" stroke="var(--stroke-0, #F5F1E8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1f2c5400} id="Vector_2" stroke="var(--stroke-0, #F5F1E8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_2006_5082">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="basis-0 bg-[#00a63e] grow h-[36px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon />
        <p className="absolute font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] left-[129.5px] not-italic text-[#f5f1e8] text-[14px] text-center text-nowrap top-[8.5px] tracking-[-0.1504px] translate-x-[-50%]">承認する</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[69.5px] size-[16px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_2006_5077)" id="Icon">
          <path d={svgPaths.p39ee6532} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M10 6L6 10" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M6 6L10 10" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_2006_5077">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="basis-0 bg-[#d4183d] grow h-[36px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon1 />
        <p className="absolute font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] left-[129.5px] not-italic text-[14px] text-center text-nowrap text-white top-[8.5px] tracking-[-0.1504px] translate-x-[-50%]">拒否する</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[36px] items-start left-0 top-[724.5px] w-[462px]" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function AdminApprovals() {
  return (
    <div className="absolute h-[273px] left-[24px] top-[81px] w-[462px]" data-name="AdminApprovals">
      <Container7 />
      <Paragraph13 />
      <Container8 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[253px] not-italic text-[#6b6b7a] text-[14px] top-[12px] tracking-[-0.1504px] w-[127px]">ID:</p>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-[#d4183d] content-stretch flex h-[36px] items-center justify-center left-[357px] px-[17px] py-[9px] rounded-[8px] top-[33px] w-[95px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(61,61,78,0.15)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-nowrap text-white tracking-[-0.1504px]">削除</p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.33333 9.33333">
            <path d={svgPaths.p48af40} id="Vector" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.33333 9.33333">
            <path d={svgPaths.p30908200} id="Vector" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function PrimitiveButton() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[478px] opacity-70 rounded-[2px] size-[16px] top-[16px]" data-name="Primitive.button">
      <Icon2 />
    </div>
  );
}

export default function PrimitiveDiv() {
  return (
    <div className="bg-[#f5f1e8] border border-[rgba(61,61,78,0.15)] border-solid overflow-clip relative rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-full" data-name="Primitive.div">
      <DialogHeader />
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] left-[143px] not-italic text-[#6b6b7a] text-[14px] top-[50px] tracking-[-0.1504px] w-[127px]">申請日: 2026-01-13</p>
      <AdminApprovals />
      <Button2 />
      <PrimitiveButton />
    </div>
  );
}