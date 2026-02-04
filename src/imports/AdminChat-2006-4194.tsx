import svgPaths from "./svg-i9shrrkve7";

function PrimitiveLabel() {
  return (
    <div className="absolute content-stretch flex h-[14px] items-center left-0 top-0 w-[256px]" data-name="Primitive.label">
      <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#3d3d4e] text-[14px] text-nowrap tracking-[-0.1504px]">{`件名 `}</p>
    </div>
  );
}

function Input() {
  return (
    <div className="absolute bg-[#eeebe3] h-[36px] left-0 rounded-[8px] top-[22px] w-[256px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#6b6b7a] text-[14px] text-nowrap tracking-[-0.1504px]">日本語</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[10px] size-[16px] top-[5px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_2006_3836)" id="Icon">
          <path d={svgPaths.p1a356800} id="Vector" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p5fcf400} id="Vector_2" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M1.33333 3.33333H9.33333" id="Vector_3" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M4.66667 1.33333H5.33333" id="Vector_4" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1bfa36c0} id="Vector_5" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M9.33333 12H13.3333" id="Vector_6" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_2006_3836">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-[#f5f1e8] border border-[rgba(61,61,78,0.15)] border-solid h-[28px] left-[153px] opacity-50 rounded-[8px] top-[-11px] w-[104px]" data-name="Button">
      <Icon />
      <p className="absolute font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] left-[64px] not-italic text-[#3d3d4e] text-[14px] text-center text-nowrap top-[3.5px] tracking-[-0.1504px] translate-x-[-50%]">自動翻訳</p>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute h-[58px] left-0 top-0 w-[256px]" data-name="Container">
      <PrimitiveLabel />
      <Input />
      <Button />
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-[#eeebe3] h-[36px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#6b6b7a] text-[14px] text-nowrap tracking-[-0.1504px]">English</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-0 top-[66px] w-[256px]" data-name="Container">
      <Input1 />
    </div>
  );
}

function Textarea() {
  return (
    <div className="bg-[#eeebe3] h-[52px] relative rounded-[8px] shrink-0 w-full" data-name="Textarea">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start px-[12px] py-[8px] relative size-full">
          <p className="font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#6b6b7a] text-[14px] text-nowrap tracking-[-0.1504px]">日本語</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex flex-col h-[52px] items-start left-0 top-[140px] w-[256px]" data-name="Container">
      <Textarea />
    </div>
  );
}

function PrimitiveLabel1() {
  return (
    <div className="absolute content-stretch flex h-[14px] items-center left-0 top-[118px] w-[485px]" data-name="Primitive.label">
      <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#3d3d4e] text-[14px] text-nowrap tracking-[-0.1504px]">{`メッセージ `}</p>
    </div>
  );
}

function Textarea1() {
  return (
    <div className="bg-[#eeebe3] h-[56px] relative rounded-[8px] shrink-0 w-[255px]" data-name="Textarea">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#6b6b7a] text-[14px] text-nowrap top-[8px] tracking-[-0.1504px]">{` English`}</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex flex-col h-[56px] items-start left-px top-[200px] w-[255px]" data-name="Container">
      <Textarea1 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[11px] size-[16px] top-[6px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_2006_3836)" id="Icon">
          <path d={svgPaths.p1a356800} id="Vector" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p5fcf400} id="Vector_2" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M1.33333 3.33333H9.33333" id="Vector_3" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M4.66667 1.33333H5.33333" id="Vector_4" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1bfa36c0} id="Vector_5" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M9.33333 12H13.3333" id="Vector_6" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_2006_3836">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#f5f1e8] h-[28px] opacity-50 relative rounded-[8px] shrink-0 w-[104px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(61,61,78,0.15)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon1 />
        <p className="absolute font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] left-[65px] not-italic text-[#3d3d4e] text-[14px] text-center text-nowrap top-[4.5px] tracking-[-0.1504px] translate-x-[-50%]">自動翻訳</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex h-[28px] items-center justify-between left-[153px] top-[107px] w-[485px]" data-name="Container">
      <Button1 />
    </div>
  );
}

function PrimitiveLabel2() {
  return (
    <div className="content-stretch flex h-[14px] items-center relative shrink-0 w-full" data-name="Primitive.label">
      <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#3d3d4e] text-[14px] text-nowrap tracking-[-0.1504px]">通知タイプ</p>
    </div>
  );
}

function Label() {
  return (
    <div className="[grid-area:1_/_2] h-[20px] relative shrink-0 w-[84px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#3d3d4e] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">アプリ内通知</p>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">
          <path d={svgPaths.p3de7e600} id="Vector" stroke="var(--stroke-0, #F5F1E8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function PrimitiveSpan() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[14px]" data-name="Primitive.span">
      <Icon2 />
    </div>
  );
}

function PrimitiveButton() {
  return (
    <div className="[grid-area:1_/_1] bg-[#3d3d4e] relative rounded-[4px] shrink-0" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border border-[#3d3d4e] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-end p-px relative">
        <PrimitiveSpan />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="gap-[8px] grid-cols-[repeat(2,_fit-content(100%))] grid-rows-[repeat(1,_fit-content(100%))] inline-grid relative shrink-0" data-name="Container">
      <Label />
      <PrimitiveButton />
    </div>
  );
}

function PrimitiveButton1() {
  return (
    <div className="bg-[#eeebe3] h-[17px] relative rounded-[4px] shrink-0 w-[18px]" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border border-[rgba(61,61,78,0.15)] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Label1() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#3d3d4e] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">メール通知</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[69.445px]" data-name="Container">
      <PrimitiveButton1 />
      <Label1 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-start flex flex-wrap gap-[4px] h-[68px] items-start relative shrink-0 w-[237px]" data-name="Container">
      <Container5 />
      <Container6 />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[43px] items-start left-[4px] top-[266px] w-[252px]" data-name="Container">
      <PrimitiveLabel2 />
      <Container7 />
    </div>
  );
}

function PrimitiveLabel3() {
  return (
    <div className="absolute h-[14px] left-0 top-0 w-[65px]" data-name="Primitive.label">
      <p className="absolute font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[14px] left-0 not-italic text-[#3d3d4e] text-[14px] text-nowrap top-0 tracking-[-0.1504px]">送信日時</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[16px] left-[40px] top-[-4px] w-[247px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[16px] left-[15px] not-italic text-[#6a7282] text-[12px] text-nowrap top-[4px]">（空欄の場合は即時送信）</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute h-[20px] left-[4px] top-[317px] w-[247px]" data-name="Container">
      <PrimitiveLabel3 />
      <Paragraph />
    </div>
  );
}

function Input2() {
  return (
    <div className="absolute bg-[#eeebe3] h-[36px] left-px rounded-[8px] top-[337px] w-[256px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#6b6b7a] text-[14px] text-nowrap tracking-[-0.1504px]">2025/4/7/15:00</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

export default function AdminChat() {
  return (
    <div className="relative size-full" data-name="AdminChat">
      <Container />
      <Container1 />
      <Container2 />
      <PrimitiveLabel1 />
      <Container3 />
      <Container4 />
      <Container8 />
      <Container9 />
      <Input2 />
    </div>
  );
}