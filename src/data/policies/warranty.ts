import type { PolicyDoc } from './types'

export const warrantyPolicy: PolicyDoc = {
  title: 'Warranty Policy Monarch',
  updated: 'Sep 3, 2026',
  reviewer: 'Monarch',
  reviewerSuffix: 'Customer Service',
  // The source document opens straight into section 1, with no standfirst.
  intro: [],
  sections: [
    {
      n: 1,
      title: 'ওয়ারেন্টি সম্পর্কে',
      blocks: [
        {
          p: 'ওয়ারেন্টি হলো বিক্রেতা, প্রস্তুতকারক বা আমদানিকারক কর্তৃক প্রদত্ত একটি সেবা, যার আওতায় নির্দিষ্ট সময়ের মধ্যে পণ্যে কোনো manufacturing defect বা স্বাভাবিক ব্যবহারের ক্ষেত্রে সৃষ্ট ত্রুটি দেখা দিলে প্রযোজ্য নীতিমালা অনুযায়ী পণ্যটি মেরামত, পরিবর্তন বা সমমানের পণ্য দিয়ে প্রতিস্থাপন করা হতে পারে।',
        },
        {
          p: 'ওয়ারেন্টির মূল উদ্দেশ্য হলো গ্রাহককে বিক্রয়-পরবর্তী সেবা প্রদান এবং পণ্যের নির্ভরযোগ্যতা নিশ্চিত করা।',
        },
      ],
    },
    {
      n: 2,
      title: 'ওয়ারেন্টির মেয়াদ',
      blocks: [
        {
          ol: [
            'প্রতিটি পণ্যের ওয়ারেন্টির মেয়াদ পণ্য, মডেল, ব্র্যান্ড এবং সংশ্লিষ্ট নীতিমালার ওপর নির্ভরশীল।',
            'ওয়ারেন্টির মেয়াদ সাধারণত ক্রয়ের তারিখ থেকে গণনা করা হবে।',
            'ক্রয়ের প্রমাণ হিসেবে বিক্রয় রসিদ, চালান/ইনভয়েস বা অন্যান্য বৈধ ক্রয় প্রমাণপত্র প্রয়োজন হতে পারে।',
            'পণ্যের নির্দিষ্ট ওয়ারেন্টি মেয়াদ ইনভয়েস, ওয়ারেন্টি কার্ড বা পণ্যের সঙ্গে দেওয়া অন্যান্য নথিতে উল্লেখ থাকতে পারে।',
            'কোনো পণ্যের ক্ষেত্রে প্রস্তুতকারক/সরবরাহকারীর আলাদা ওয়ারেন্টি নীতিমালা থাকলে সেই নীতিমালা প্রযোজ্য হবে।',
          ],
        },
      ],
    },
    {
      n: 3,
      title: 'ওয়ারেন্টির আওতায় যা থাকবে',
      blocks: [
        { p: 'নিম্নোক্ত ধরনের ত্রুটি সাধারণত ওয়ারেন্টির আওতায় বিবেচিত হতে পারে:' },
        {
          ul: [
            'Manufacturing defect',
            'স্বাভাবিক ব্যবহারের সময় দেখা দেওয়া অভ্যন্তরীণ ত্রুটি',
            'প্রস্তুতকারকের ত্রুটির কারণে পণ্যের কার্যক্ষমতা নষ্ট হওয়া',
            'অনুমোদিত ব্যবহারের মধ্যে থাকা hardware failure',
          ],
        },
        {
          p: 'ওয়ারেন্টি গ্রহণের পর পণ্য পরীক্ষা বা diagnosis করা হতে পারে। পরীক্ষার ফলাফলের ভিত্তিতে ওয়ারেন্টি প্রযোজ্য কি না তা নির্ধারণ করা হবে।',
        },
      ],
    },
    {
      n: 4,
      title: 'ওয়ারেন্টির আওতায় যা থাকবে না',
      blocks: [
        { p: 'নিম্নোক্ত ক্ষেত্রে সাধারণত ওয়ারেন্টি প্রযোজ্য হবে না:' },
        { b: 'ক. Physical Damage' },
        {
          ul: [
            'পণ্য ভাঙা, ফাটা বা বাঁকা হলে',
            'পড়ে গিয়ে ক্ষতিগ্রস্ত হলে',
            'স্ক্রিনে crack, deep scratch বা impact damage থাকলে',
            'কোনো port, connector বা socket ভাঙা হলে',
            'casing বা body-তে গুরুতর আঘাতের চিহ্ন থাকলে',
          ],
        },
        { b: 'খ. Liquid Damage' },
        {
          ul: [
            'পানি, চা, কফি বা অন্য কোনো তরল পদার্থের কারণে ক্ষতি হলে',
            'Liquid spill বা liquid corrosion পাওয়া গেলে',
          ],
        },
        { b: 'গ. Burn / Electrical Damage' },
        {
          ul: [
            'অতিরিক্ত voltage, short circuit বা electrical surge-এর কারণে ক্ষতি হলে',
            'কোনো component পুড়ে গেলে',
            'অনুপযুক্ত power supply ব্যবহারের কারণে ক্ষতি হলে',
          ],
        },
        { b: 'ঘ. Physical Tampering' },
        {
          ul: [
            'পণ্যের casing খোলা হলে',
            'unauthorized repair বা modification করা হলে',
            'PCB বা circuit board-এ কাটাছেঁড়া বা modification পাওয়া গেলে',
            'কোনো component পরিবর্তন বা প্রতিস্থাপন করা হলে',
            'security/warranty sticker বা serial number নষ্ট, অপসারণ বা অস্পষ্ট হলে',
          ],
        },
        { b: 'ঙ. Corrosion / Insect Damage' },
        {
          ul: ['মরিচা বা corrosion-এর কারণে ক্ষতি হলে', 'পোকামাকড় বা অন্যান্য প্রাণীর কারণে ক্ষতি হলে'],
        },
        {
          p: 'এই ধরনের physical damage, tampering, corrosion ও insect-related damage-কে warranty-এর বাইরে রাখা হয়েছে।',
        },
      ],
    },
    {
      n: 5,
      title: 'Serial Number ও Warranty Sticker',
      blocks: [
        {
          ol: [
            'পণ্যের Serial Number warranty যাচাইয়ের জন্য গুরুত্বপূর্ণ।',
            'Serial Number পরিবর্তিত, অস্পষ্ট, অপসারিত বা পণ্যের সঙ্গে অসামঞ্জস্যপূর্ণ হলে warranty বাতিল হতে পারে।',
            'Warranty sticker/security seal ক্ষতিগ্রস্ত বা অপসারণ করা হলে warranty প্রযোজ্য নাও হতে পারে।',
            'একই serial number-এর পণ্য পরিবর্তন করে অন্য কোনো unit warranty claim হিসেবে উপস্থাপন করা যাবে না।',
          ],
        },
      ],
    },
    {
      n: 6,
      title: 'Warranty Claim করার নিয়ম',
      blocks: [
        { p: 'Warranty claim করার সময় গ্রাহককে:' },
        {
          ol: [
            'পণ্যটি নির্ধারিত warranty/service point-এ জমা দিতে হবে।',
            'ক্রয়ের বৈধ প্রমাণপত্র/ইনভয়েস প্রদান করতে হবে।',
            'পণ্যের বক্স ও অন্যান্য এক্সেসরিস সাথে আনতে হবে।',
            'পণ্যের সম্পূর্ণ serial number বা identification information প্রদান করতে হবে।',
            'সমস্যাটি যথাসম্ভব পরিষ্কারভাবে জানাতে হবে।',
            'প্রয়োজন হলে ত্রুটিপূর্ণ অংশের ছবি বা ভিডিও প্রদান করতে হবে।',
          ],
        },
      ],
    },
    {
      n: 7,
      title: 'Diagnosis ও Service',
      blocks: [
        { p: 'Warranty claim গ্রহণের পর পণ্যটি technical team দ্বারা পরীক্ষা করা হবে।' },
        { b: 'Diagnosis সম্পন্ন হওয়ার আগে warranty approval বা replacement নিশ্চিত করা হবে না।' },
        {
          p: 'পরীক্ষায় যদি দেখা যায় যে সমস্যাটি warranty-এর আওতাভুক্ত নয়, তাহলে প্রযোজ্য ক্ষেত্রে paid repair/service-এর সুযোগ দেওয়া যেতে পারে।',
        },
      ],
    },
    {
      n: 8,
      title: 'Repair / Replacement',
      blocks: [
        { p: 'Warranty claim অনুমোদিত হলে কোম্পানি পরিস্থিতি অনুযায়ী:' },
        {
          ul: [
            'পণ্য repair করতে পারে;',
            'defective component পরিবর্তন করতে পারে;',
            'একই বা সমমানের replacement product দিতে পারে;',
            'অথবা সংশ্লিষ্ট brand/supplier-এর policy অনুযায়ী অন্য কোনো সমাধান দিতে পারে।',
          ],
        },
        {
          p: 'Replacement product একই model-এর না-ও হতে পারে। একই model বাজারে unavailable হলে সমমানের বা upgraded model দেওয়া যেতে পারে; upgraded product গ্রহণ করলে অতিরিক্ত মূল্য প্রযোজ্য হতে পারে।',
        },
      ],
    },
    {
      n: 9,
      title: 'Replacement পণ্য না থাকলে',
      blocks: [
        {
          p: 'Warranty period-এর মধ্যে পণ্য replacement-এর প্রয়োজন হলেও যদি একই পণ্য বাজারে বা stock-এ না থাকে, তাহলে কোম্পানি পরিস্থিতি অনুযায়ী:',
        },
        {
          ul: [
            'সমমানের বিকল্প পণ্য দিতে পারে;',
            'upgraded product অফার করতে পারে;',
            'অথবা প্রযোজ্য নীতিমালা অনুযায়ী অন্য সমাধান দিতে পারে।',
          ],
        },
      ],
    },
    {
      n: 10,
      title: 'Warranty Service-এর সময়',
      blocks: [
        {
          p: 'Warranty service-এর সময় পণ্যের ধরন, সমস্যার প্রকৃতি, spare parts availability এবং supplier/manufacturer-এর response time-এর ওপর নির্ভর করতে পারে।',
        },
        {
          p: 'বিশেষ করে ঢাকার বাইরে থেকে পণ্য পাঠানো হলে transportation ও diagnosis-এর কারণে অতিরিক্ত সময় প্রয়োজন হতে পারে।',
        },
      ],
    },
    {
      n: 11,
      title: 'Transportation / Courier Charge',
      blocks: [
        {
          p: 'Warranty service-এর জন্য পণ্য পাঠানো বা ফেরত নেওয়ার ক্ষেত্রে transportation/courier charge প্রযোজ্য হতে পারে।',
        },
        { p: 'Warranty claim-এর ক্ষেত্রে courier/transportation charge ক্রেতাকে বহণ করতে হবে।' },
      ],
    },
    {
      n: 12,
      title: 'Data Backup',
      blocks: [
        { p: 'Warranty service-এর আগে গ্রাহককে অবশ্যই নিজের গুরুত্বপূর্ণ:' },
        { ul: ['Personal Data', 'Documents', 'Photos', 'Videos', 'Software', 'Other Files'] },
        { p: 'ব্যাকআপ করে নিতে হবে।' },
        {
          p: 'Service বা repair-এর সময় data loss, operating system reinstallation বা storage replacement হলে কোম্পানি কোনো data loss-এর জন্য দায়ী থাকবে না।',
        },
      ],
    },
    {
      n: 13,
      title: 'Accessories',
      blocks: [
        {
          p: 'চার্জার, পাওয়ার কেবল, USB cable, adapter, remote, battery, toner, cartridge, stand এবং অন্যান্য accessories-এর warranty মূল পণ্যের warranty থেকে আলাদা হতে পারে।',
        },
        {
          p: 'কিছু accessories-এর ক্ষেত্রে কোনো warranty নাও থাকতে পারে। সংশ্লিষ্ট product/brand policy প্রযোজ্য হবে।',
        },
      ],
    },
    {
      n: 14,
      title: 'Warranty Transfer',
      blocks: [
        { p: 'Warranty সাধারণত মূল ক্রেতা ও নির্দিষ্ট serial number-এর পণ্যের সঙ্গে সম্পর্কিত।' },
        {
          p: 'কোম্পানির পূর্বানুমোদন ছাড়া অন্য ব্যক্তি বা প্রতিষ্ঠানের কাছে পণ্য হস্তান্তর করলে warranty transfer প্রযোজ্য হবে কি না তা কোম্পানি/brand policy অনুযায়ী নির্ধারিত হবে।',
        },
      ],
    },
    {
      n: 15,
      title: 'International Warranty',
      blocks: [
        {
          p: 'কোনো পণ্যে International Warranty থাকলে সংশ্লিষ্ট brand-এর International Warranty Policy প্রযোজ্য হবে।',
        },
        { p: 'সব model, region বা product category-তে International Warranty প্রযোজ্য নাও হতে পারে।' },
      ],
    },
    {
      n: 16,
      title: 'গুরুত্বপূর্ণ শর্ত',
      blocks: [
        {
          ul: [
            'Warranty শুধুমাত্র manufacturing defect বা warranty-covered technical fault-এর ক্ষেত্রে প্রযোজ্য।',
            'Physical, liquid, burn, corrosion এবং unauthorized modification সাধারণত warranty-এর আওতাভুক্ত নয়।',
            'Warranty claim-এর ক্ষেত্রে valid purchase document অবশ্যই সাথে আনতে হবে।',
            'পণ্যের বক্স ও অন্যান্য এক্সেসরিস সাথে আনতে হবে।',
            'Warranty approval সম্পূর্ণ technical diagnosis-এর ওপর নির্ভরশীল।',
            'Warranty service-এর সময় product availability ও spare parts-এর ওপর নির্ভর করতে পারে।',
            'Manufacturer/brand-এর নিজস্ব warranty policy থাকলে সেটিই চূড়ান্তভাবে প্রযোজ্য হবে।',
            'কোম্পানি প্রয়োজন অনুযায়ী warranty policy পরিবর্তন বা সংশোধন করার অধিকার সংরক্ষণ করে।',
          ],
        },
      ],
    },
    {
      n: 17,
      title: 'সংক্ষিপ্ত Disclaimer',
      unnumbered: true,
      blocks: [
        {
          p: 'এই Warranty Policy একটি সাধারণ নির্দেশিকা। নির্দিষ্ট পণ্যের ক্ষেত্রে সংশ্লিষ্ট Brand/Manufacturer-এর Warranty Policy, Warranty Card, Invoice এবং Product-specific Terms & Conditions প্রাধান্য পাবে।',
        },
      ],
    },
  ],
}
