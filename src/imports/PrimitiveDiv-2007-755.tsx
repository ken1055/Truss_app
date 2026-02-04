import svgPaths from "./svg-65cignze84";

function PrimitiveH() {
  return (
    <div className="absolute h-[18px] left-[24px] top-[24px] w-[462px]" data-name="Primitive.h2">
      <p className="absolute font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] left-0 not-italic text-[#3d3d4e] text-[18px] text-nowrap top-0 tracking-[-0.4395px]">イベント編集</p>
    </div>
  );
}

function PrimitiveLabel() {
  return (
    <div className="content-stretch flex h-[14px] items-center relative shrink-0 w-full" data-name="Primitive.label">
      <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#3d3d4e] text-[14px] text-nowrap tracking-[-0.1504px]">{`イベント名 `}</p>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[#eeebe3] h-[36px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[normal] left-[13px] not-italic text-[#6b6b7a] text-[14px] text-nowrap top-[9px] tracking-[-0.1504px]">日本語</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_0px_0px_0.683px_rgba(61,61,78,0.11)]" />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[58px] items-start relative shrink-0 w-full" data-name="Container">
      <PrimitiveLabel />
      <Input />
    </div>
  );
}

function Input1() {
  return (
    <div className="absolute bg-[#eeebe3] h-[39px] left-0 rounded-[8px] top-0 w-[429px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#6b6b7a] text-[14px] text-nowrap tracking-[-0.1504px]">English</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col h-[39px] items-start relative shrink-0 w-full" data-name="Container">
      <Input1 />
    </div>
  );
}

function PrimitiveLabel1() {
  return (
    <div className="content-stretch flex h-[14px] items-center relative shrink-0 w-full" data-name="Primitive.label">
      <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#3d3d4e] text-[14px] text-nowrap tracking-[-0.1504px]">{`説明 `}</p>
    </div>
  );
}

function Textarea() {
  return (
    <div className="bg-[#eeebe3] h-[64px] relative rounded-[8px] shrink-0 w-full" data-name="Textarea">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[86px] items-start relative shrink-0 w-full" data-name="Container">
      <PrimitiveLabel1 />
      <Textarea />
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[normal] left-[14px] not-italic text-[#6b6b7a] text-[14px] text-nowrap top-[29px] tracking-[-0.1504px]">日本語</p>
    </div>
  );
}

function Icon() {
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

function Button() {
  return (
    <div className="absolute bg-[#f5f1e8] h-[28px] left-[325px] opacity-50 rounded-[8px] top-[119px] w-[104px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(61,61,78,0.15)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Icon />
      <p className="absolute font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] left-[65px] not-italic text-[#3d3d4e] text-[14px] text-center text-nowrap top-[4.5px] tracking-[-0.1504px] translate-x-[-50%]">自動翻訳</p>
    </div>
  );
}

function Textarea1() {
  return (
    <div className="bg-[#eeebe3] h-[64px] relative rounded-[8px] shrink-0 w-full" data-name="Textarea">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container3() {
  return <div className="h-[28px] shrink-0 w-full" data-name="Container" />;
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col h-[64px] items-start relative shrink-0 w-full" data-name="Container">
      <Textarea1 />
      <Container3 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[16px] not-italic text-[#6b6b7a] text-[14px] text-nowrap top-[7px] tracking-[-0.1504px]">English</p>
    </div>
  );
}

function PrimitiveLabel2() {
  return (
    <div className="content-stretch flex h-[14px] items-center relative shrink-0 w-full" data-name="Primitive.label">
      <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#3d3d4e] text-[14px] text-nowrap tracking-[-0.1504px]">LINEグループ招待リンク</p>
    </div>
  );
}

function Input2() {
  return (
    <div className="bg-[#eeebe3] h-[36px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#6b6b7a] text-[14px] text-nowrap tracking-[-0.1504px]">https://line.me/ti/g/...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px">参加者がイベント登録後にLINEグループに参加できるリンクを入力してください</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[82px] items-start relative shrink-0 w-full" data-name="Container">
      <PrimitiveLabel2 />
      <Input2 />
      <Paragraph />
    </div>
  );
}

function Button1() {
  return (
    <div className="basis-0 bg-[#00a63e] grow h-[36px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[16px] py-[8px] relative size-full">
          <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] text-center text-nowrap tracking-[-0.1504px]">保存</p>
        </div>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="basis-0 bg-[#d4183d] grow h-[36px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(61,61,78,0.15)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[17px] py-[9px] relative size-full">
          <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-nowrap text-white tracking-[-0.1504px]">イベント削除</p>
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[36px] items-start left-[202px] top-[425px] w-[462px]" data-name="Container">
      <Button1 />
      <Button2 />
    </div>
  );
}

function AdminEvents() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] h-[922px] items-start left-[24px] top-[58px] w-[429px]" data-name="AdminEvents">
      <Container />
      <Container1 />
      <Container2 />
      <Button />
      <Container4 />
      <Container5 />
      <Container6 />
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

function Button3() {
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

function Container7() {
  return (
    <div className="absolute content-stretch flex h-[28px] items-center justify-between left-[349px] top-[44px] w-[114px]" data-name="Container">
      <Button3 />
    </div>
  );
}

function PrimitiveLabel3() {
  return (
    <div className="content-stretch flex h-[14px] items-center relative shrink-0 w-full" data-name="Primitive.label">
      <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#3d3d4e] text-[14px] text-nowrap tracking-[-0.1504px]">最大参加者数</p>
    </div>
  );
}

function Input3() {
  return (
    <div className="bg-[#eeebe3] h-[36px] relative rounded-[8px] shrink-0 w-[76px]" data-name="Input">
      <div className="content-stretch flex items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[29px] not-italic text-[#3d3d4e] text-[14px] text-nowrap top-[8px] tracking-[-0.1504px]">30</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[58px] items-start left-[508px] top-[394px] w-[292px]" data-name="Container">
      <PrimitiveLabel3 />
      <Input3 />
    </div>
  );
}

function PrimitiveLabel4() {
  return (
    <div className="content-stretch flex h-[14px] items-center relative shrink-0 w-full" data-name="Primitive.label">
      <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#3d3d4e] text-[14px] text-nowrap tracking-[-0.1504px]">場所 (Google Map URL)</p>
    </div>
  );
}

function Input4() {
  return (
    <div className="bg-[#eeebe3] h-[36px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[12px] py-[4px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#6b6b7a] text-[14px] text-nowrap tracking-[-0.1504px]">https://googlemap...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[58px] items-start left-[508px] top-[321px] w-[294px]" data-name="Container">
      <PrimitiveLabel4 />
      <Input4 />
    </div>
  );
}

function PrimitiveLabel5() {
  return (
    <div className="content-stretch flex h-[14px] items-center relative shrink-0 w-full" data-name="Primitive.label">
      <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#3d3d4e] text-[14px] text-nowrap tracking-[-0.1504px]">日付</p>
    </div>
  );
}

function Input5() {
  return (
    <div className="bg-[#eeebe3] h-[36px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container10() {
  return (
    <div className="[grid-area:1_/_1] content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[91px]" data-name="Container">
      <PrimitiveLabel5 />
      <Input5 />
    </div>
  );
}

function Input6() {
  return (
    <div className="absolute bg-[#eeebe3] h-[36px] left-[-37px] rounded-[8px] top-[22px] w-[74px]" data-name="Input">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container11() {
  return (
    <div className="[grid-area:1_/_2] content-stretch flex flex-col gap-[8px] h-[58px] items-start relative shrink-0" data-name="Container">
      <Input6 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[-19px] not-italic text-[#6b6b7a] text-[14px] text-nowrap top-[31px] tracking-[-0.1504px]">13:00</p>
    </div>
  );
}

function PrimitiveLabel6() {
  return (
    <div className="absolute content-stretch flex h-[14px] items-center left-[118px] top-0 w-[28px]" data-name="Primitive.label">
      <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#3d3d4e] text-[14px] text-nowrap tracking-[-0.1504px]">時間</p>
    </div>
  );
}

function Input7() {
  return (
    <div className="absolute bg-[#eeebe3] h-[36px] left-[220px] rounded-[8px] top-[22px] w-[74px]" data-name="Input">
      <div className="content-stretch flex items-start overflow-clip p-px relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[18px] not-italic text-[#6b6b7a] text-[14px] text-nowrap top-[9px] tracking-[-0.1504px]">16:00</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute gap-[16px] grid grid-cols-[repeat(2,_minmax(0px,_1fr))] grid-rows-[repeat(2,_minmax(0px,_1fr))] h-[132px] left-[510px] top-[245px] w-[294px]" data-name="Container">
      <Container10 />
      <Container11 />
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[normal] left-[199px] not-italic text-[#6b6b7a] text-[14px] text-nowrap top-[31px] tracking-[-0.1504px]">〜</p>
      <PrimitiveLabel6 />
      <Input7 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[8px] not-italic text-[#6b6b7a] text-[14px] text-nowrap top-[31px] tracking-[-0.1504px]">2026/4/20</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute h-[16px] left-[516px] top-[211px] w-[288px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px">PNG, JPG, GIF（最大10MB）</p>
    </div>
  );
}

function PrimitiveLabel7() {
  return (
    <div className="absolute content-stretch flex h-[14px] items-center left-[510px] top-[57px] w-[294px]" data-name="Primitive.label">
      <p className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#3d3d4e] text-[14px] text-nowrap tracking-[-0.1504px]">イベント画像</p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[89px] size-[16px] top-[55px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p23ad1400} id="Vector" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p26e09a00} id="Vector_2" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 2V10" id="Vector_3" stroke="var(--stroke-0, #3D3D4E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute bg-[#f5f1e8] border border-[rgba(61,61,78,0.15)] border-solid h-[126px] left-[508px] rounded-[8px] top-[78px] w-[296px]" data-name="Button">
      <Icon2 />
      <p className="absolute font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] left-[160px] not-italic text-[#3d3d4e] text-[14px] text-center text-nowrap top-[55px] tracking-[-0.1504px] translate-x-[-50%]">アップロード</p>
    </div>
  );
}

function Icon3() {
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
    <div className="absolute content-stretch flex flex-col items-start left-[777px] opacity-70 rounded-[2px] size-[16px] top-[16px]" data-name="Primitive.button">
      <Icon3 />
    </div>
  );
}

export default function PrimitiveDiv() {
  return (
    <div className="bg-white border border-[rgba(61,61,78,0.15)] border-solid overflow-clip relative rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-full" data-name="Primitive.div">
      <PrimitiveH />
      <AdminEvents />
      <Container7 />
      <Container8 />
      <Container9 />
      <Container12 />
      <Paragraph1 />
      <PrimitiveLabel7 />
      <Button4 />
      <PrimitiveButton />
    </div>
  );
}