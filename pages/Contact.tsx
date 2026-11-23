import * as React from 'react';
import { Phone, Mail, MapPin, Send, Clock, CheckCircle, Globe } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useApp } from '../App';
import CampusMap from '../components/CampusMap';

const Contact: React.FC = () => {
  const { lang, t, settings, addContactMessage } = useApp();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [contactForm, setContactForm] = React.useState({
    name: '',
    mobile: '',
    email: '',
    message: '',
  });

  const handleForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await addContactMessage({
        id: `msg-${Date.now()}`,
        name: contactForm.name,
        mobile: contactForm.mobile,
        email: contactForm.email,
        message: contactForm.message,
        status: 'unread',
        date: new Date().toISOString().split('T')[0],
      });
      setContactForm({ name: '', mobile: '', email: '', message: '' });
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      console.error('Failed to save contact message:', err);
      setSubmitError(
        lang === 'bn'
          ? 'বার্তাটি সার্ভারে পাঠানো যায়নি। দয়া করে সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন।'
          : 'Could not send your message to the server. Please verify your mobile number and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-block bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
          Get in Touch
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-green-900 dark:text-white tracking-tight">
          {t(TRANSLATIONS.nav.contact)}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-base md:text-lg font-medium">
          {lang === 'bn'
            ? 'বিদ্যালয় সংক্রান্ত যেকোনো তথ্য বা সাহায্যের জন্য আমাদের সাথে যোগাযোগ করতে পারেন।'
            : 'For any information or inquiries regarding the school, feel free to contact us.'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          {[
            {
              icon: Phone,
              title: lang === 'bn' ? 'ফোন করুন' : 'Phone Call',
              value: settings.phone,
              color: 'text-green-600 dark:text-green-400',
              bg: 'bg-green-100 dark:bg-green-950',
            },
            {
              icon: Mail,
              title: lang === 'bn' ? 'ইমেইল' : 'Email Address',
              value: settings.email,
              color: 'text-blue-600 dark:text-blue-400',
              bg: 'bg-blue-100 dark:bg-blue-950',
            },
            {
              icon: MapPin,
              title: lang === 'bn' ? 'লোকেশন' : 'Campus Location',
              value: t(settings.location),
              color: 'text-purple-600 dark:text-purple-400',
              bg: 'bg-purple-100 dark:bg-purple-950',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-7 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 hover:shadow-lg transition-all"
            >
              <div className={`${item.bg} w-14 h-14 rounded-2xl flex items-center justify-center ${item.color}`}>
                <item.icon className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-400 text-[11px] uppercase tracking-wider">{item.title}</h3>
                <p className="text-slate-900 dark:text-white font-black text-base leading-snug break-words">
                  {item.value}
                </p>
              </div>
            </div>
          ))}

          <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Clock className="w-28 h-28" />
            </div>
            <h3 className="font-black text-xl relative z-10">{lang === 'bn' ? 'অফিস সময়সূচী' : 'Office Schedule'}</h3>
            <div className="space-y-3 relative z-10 text-sm">
              <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                <span className="text-slate-400 font-bold">{lang === 'bn' ? 'রবিবার - বৃহস্পতিবার' : 'Sun - Thu'}</span>
                <span className="font-black">১০:০০ AM - ৪:০০ PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">{lang === 'bn' ? 'শুক্রবার - শনিবার' : 'Fri - Sat'}</span>
                <span className="font-black text-amber-400 uppercase">{lang === 'bn' ? 'সাপ্তাহিক ছুটি' : 'Closed'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="bg-green-700 p-10 text-white relative">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Globe className="w-32 h-32" />
            </div>
            <h2 className="text-3xl font-black relative z-10">{lang === 'bn' ? 'আমাদের বার্তা পাঠান' : 'Send a Message'}</h2>
            <p className="opacity-90 mt-1 text-base font-medium relative z-10">
              {lang === 'bn' ? 'আপনার জিজ্ঞাসা নিচে লিখে পাঠান।' : 'Write your question below and our office will respond.'}
            </p>
          </div>

          <form onSubmit={handleForm} className="p-8 md:p-10 space-y-6">
            {sent ? (
              <div className="py-16 flex flex-col items-center text-center space-y-5">
                <div className="bg-green-100 dark:bg-green-950 w-20 h-20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shadow-lg">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'বার্তাটি সফলভাবে পাঠানো হয়েছে!' : 'Message Sent Successfully!'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm">
                  {lang === 'bn' ? 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব। ধন্যবাদ।' : 'We will contact you shortly. Thank you.'}
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="text-green-700 dark:text-green-400 font-black uppercase text-xs tracking-wider hover:underline"
                >
                  {lang === 'bn' ? 'আরেকটি বার্তা পাঠান' : 'Send another message'}
                </button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                      {lang === 'bn' ? 'আপনার নাম' : 'Your Name'}
                    </label>
                    <input
                      required
                      minLength={1}
                      maxLength={150}
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none font-bold"
                      placeholder="e.g. Abdullah Al Mamun"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                      {lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                    </label>
                    <input
                      required
                      minLength={6}
                      maxLength={30}
                      type="tel"
                      value={contactForm.mobile}
                      onChange={(e) => setContactForm((p) => ({ ...p, mobile: e.target.value }))}
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none font-bold"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                    {lang === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
                  </label>
                  <input
                    maxLength={150}
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                    {lang === 'bn' ? 'আপনার বার্তা' : 'Your Message'}
                  </label>
                  <textarea
                    required
                    minLength={1}
                    maxLength={2000}
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none font-bold resize-none"
                    placeholder="Write your message here..."
                  />
                </div>

                {submitError && (
                  <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold">
                    {submitError}
                  </div>
                )}

                <button
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 bg-green-700 text-white py-4 rounded-2xl font-black text-lg hover:bg-green-800 shadow-xl transition-all active:scale-95 disabled:opacity-60"
                >
                  {lang === 'bn' ? 'মেসেজ পাঠান' : 'Send Message'} <Send className="w-5 h-5" />
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Interactive Google Maps Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            {lang === 'bn' ? 'ম্যাপে আমাদের অবস্থান' : 'Find Campus on Google Maps'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{t(settings.location)}</p>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
          <CampusMap
            schoolName={t(settings.name)}
            address={t(settings.location)}
            lat={settings.latitude}
            lng={settings.longitude}
            lang={lang}
            heightClass="h-[460px]"
          />
        </div>
      </section>
    </div>
  );
};

export default Contact;
