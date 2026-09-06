import type { PolicyDoc } from './types'

export const refundReturnPolicy: PolicyDoc = {
  title: 'Refund & Return Policy Monarch',
  updated: 'Sep 3, 2026',
  reviewer: 'Monarch',
  reviewerSuffix: 'Customer Service',
  intro: [
    'Monarch IT Limited থেকে পণ্য কেনার জন্য ধন্যবাদ। আমাদের লক্ষ্য হলো সঠিক পণ্য, স্বচ্ছ সেবা এবং সহজ Return & Refund সুবিধা নিশ্চিত করা।',
  ],
  sections: [
    {
      n: 1,
      title: 'Return করার যোগ্যতা',
      blocks: [
        { p: 'নিম্নলিখিত ক্ষেত্রে পণ্য Return/Replacement-এর জন্য বিবেচিত হতে পারে:' },
        {
          ul: [
            'ভুল পণ্য বা ভুল মডেল সরবরাহ করা হলে',
            'অর্ডারের সঙ্গে ভিন্ন পণ্য সরবরাহ করা হলে',
            'ডেলিভারির সময় পণ্য দৃশ্যমানভাবে ক্ষতিগ্রস্ত অবস্থায় পাওয়া গেলে',
            'পণ্যে manufacturing defect পাওয়া গেলে এবং সেটি সংশ্লিষ্ট Warranty Policy-এর আওতায় পড়লে',
            'পণ্যের নির্দিষ্ট product page-এ Return সুবিধা উল্লেখ থাকলে',
          ],
        },
        { b: 'Return গ্রহণযোগ্যতা পণ্যভেদে ভিন্ন হতে পারে।' },
      ],
    },
    {
      n: 2,
      title: 'Return করার সময়সীমা',
      blocks: [
        { p: 'পণ্য গ্রহণের পর ৩-৭ দিনের মধ্যে Return request করতে হবে।' },
        { p: 'Return request করার সময়:' },
        {
          ul: [
            'Order ID/Invoice প্রদান করতে হবে',
            'সমস্যার সংক্ষিপ্ত বিবরণ দিতে হবে',
            'প্রয়োজনে পণ্যের ছবি বা ভিডিও দিতে হতে পারে',
            'আমাদের Customer Support-এর অনুমোদন ছাড়া পণ্য ফেরত পাঠানো উচিত নয়',
          ],
        },
      ],
    },
    {
      n: 3,
      title: 'Return-এর শর্ত',
      blocks: [
        { p: 'Return গ্রহণের ক্ষেত্রে সাধারণত:' },
        {
          ul: [
            'পণ্যটি অব্যবহৃত বা স্বাভাবিক অবস্থায় থাকতে হবে',
            'মূল প্যাকেজিং, accessories, manuals এবং অন্যান্য সরবরাহকৃত সামগ্রী থাকতে হবে',
            'Serial Number/IMEI/Barcode পরিবর্তিত বা অপসারিত হওয়া যাবে না',
            'পণ্যে physical damage, burn, liquid damage বা unauthorized modification থাকা যাবে না',
            'Warranty/serial sticker নষ্ট বা অপসারণ করা যাবে না',
          ],
        },
      ],
    },
    {
      n: 4,
      title: 'যেসব ক্ষেত্রে Return গ্রহণযোগ্য নয়',
      blocks: [
        { p: 'নিম্নলিখিত কারণে Return/Refund প্রযোজ্য নাও হতে পারে:' },
        {
          ul: [
            'গ্রাহকের ব্যবহারে পণ্য ক্ষতিগ্রস্ত হলে',
            'ভাঙা, পোড়া, বাঁকা বা physical damage থাকলে',
            'Liquid/Water damage হলে',
            'Voltage fluctuation বা electrical damage হলে',
            'Unauthorized repair বা modification করা হলে',
            'Serial number বা warranty sticker পরিবর্তন/অপসারণ করা হলে',
            'পণ্যের অংশ পরিবর্তন করা হলে',
            'ভুলভাবে ব্যবহার বা installation-এর কারণে সমস্যা হলে',
            'পণ্য হারিয়ে গেলে',
            'শুধুমাত্র ব্যক্তিগত পছন্দ পরিবর্তনের কারণে, যদি পণ্যটি Return-eligible না হয়',
          ],
        },
      ],
    },
    {
      n: 5,
      title: 'Replacement Policy',
      blocks: [
        { p: 'Return request অনুমোদিত হলে প্রথমে replacement/repair-এর ব্যবস্থা করা হতে পারে।' },
        { p: 'একই পণ্য available না থাকলে:' },
        {
          ul: [
            'সমমানের বিকল্প পণ্য দেওয়া হতে পারে; অথবা',
            'প্রযোজ্য ক্ষেত্রে Refund প্রদান করা হতে পারে; অথবা',
            'উচ্চমূল্যের বিকল্প পণ্য নিতে চাইলে অতিরিক্ত মূল্য পরিশোধ করতে হতে পারে।',
          ],
        },
      ],
    },
    {
      n: 6,
      title: 'Refund Policy',
      blocks: [
        { p: 'Refund প্রযোজ্য হলে যাচাই ও Return process সম্পন্ন হওয়ার পর Refund করা হবে।' },
        { p: 'Refund-এর মাধ্যম অর্ডারের payment method-এর ওপর নির্ভর করতে পারে।' },
        { b: 'সম্ভাব্য Refund সময়:' },
        {
          ul: [
            'Online Payment: ৩–৭ কর্মদিবস',
            'Bank/MFS: ৩–৭ কর্মদিবস',
            'COD Order: ৩–৭ কর্মদিবস, প্রয়োজনীয় payment information পাওয়ার পর',
          ],
        },
        {
          p: 'ব্যাংক, payment gateway বা mobile financial service-এর processing time-এর কারণে প্রকৃত সময় কিছুটা বেশি হতে পারে।',
        },
      ],
    },
    {
      n: 7,
      title: 'Delivery Charge',
      blocks: [
        {
          p: 'ভুল পণ্য, manufacturing defect বা আমাদের পক্ষ থেকে হওয়া ভুলের কারণে Return হলে প্রযোজ্য ক্ষেত্রে Return/Replacement-এর পরিবহন খরচ Monarch IT Limited বহন করতে পারে।',
        },
        {
          p: 'গ্রাহকের ব্যক্তিগত কারণে Return করলে প্রযোজ্য delivery/return charge গ্রাহককে বহন করতে হতে পারে।',
        },
      ],
    },
    {
      n: 8,
      title: 'Refund-এর আগে Product Inspection',
      blocks: [
        { p: 'Return করা পণ্য আমাদের টিম বা সংশ্লিষ্ট ব্র্যান্ড/সার্ভিস সেন্টার দ্বারা পরীক্ষা করা হতে পারে।' },
        {
          p: 'পরীক্ষায় যদি দেখা যায় যে সমস্যাটি Warranty/Return Policy-এর আওতায় পড়ে না, তাহলে Return বা Refund request প্রত্যাখ্যান করা হতে পারে।',
        },
      ],
    },
    {
      n: 9,
      title: 'পণ্যের Warranty থাকলে',
      blocks: [
        {
          p: 'কোনো পণ্যের আলাদা Manufacturer/Brand Warranty থাকলে manufacturing defect-এর ক্ষেত্রে সংশ্লিষ্ট Warranty Policy প্রযোজ্য হতে পারে।',
        },
        {
          p: 'Return period শেষ হওয়ার পর warranty-related সমস্যার ক্ষেত্রে সরাসরি Refund-এর পরিবর্তে brand warranty অনুযায়ী repair/replacement/service দেওয়া হতে পারে।',
        },
      ],
    },
    {
      n: 10,
      title: 'Order Cancellation',
      blocks: [
        { p: 'পণ্য shipment-এর আগে cancellation request করলে cancellation গ্রহণ করা যেতে পারে।' },
        {
          p: 'পণ্য ইতোমধ্যে courier-এ পাঠানো হয়ে গেলে cancellation-এর ক্ষেত্রে applicable delivery/return charge কেটে Refund করা হতে পারে।',
        },
      ],
    },
    {
      n: 11,
      title: 'Advance Payment করা অর্ডার',
      blocks: [
        {
          p: 'কোনো কারণে পণ্য সরবরাহ করা সম্ভব না হলে এবং বিকল্প পণ্য গ্রহণ না করলে, প্রযোজ্য ক্ষেত্রে গ্রাহকের পরিশোধ করা অর্থ Refund করা হবে।',
        },
      ],
    },
    {
      n: 12,
      title: 'গুরুত্বপূর্ণ নোট',
      blocks: [
        {
          ul: [
            'Refund/Return অনুমোদন সম্পূর্ণভাবে পণ্যের অবস্থা, সমস্যার ধরন এবং প্রযোজ্য policy-এর ওপর নির্ভরশীল।',
            'কিছু পণ্যের ক্ষেত্রে Brand/Manufacturer-এর নিজস্ব Return বা Warranty Policy প্রাধান্য পেতে পারে।',
            'Promotional, clearance, customized বা বিশেষভাবে উল্লেখিত পণ্যের জন্য আলাদা Return Policy থাকতে পারে।',
            'Refund করার আগে সকল Return condition পূরণ হয়েছে কিনা যাচাই করা হবে।',
            'Monarch IT Limited প্রয়োজনে এই policy পরিবর্তন বা আপডেট করার অধিকার সংরক্ষণ করে।',
          ],
        },
      ],
    },
  ],
}
