
import * as React from 'react';
import { Phone, Mail, MapPin, Send, Clock, CheckCircle, Smartphone, Globe } from 'lucide-react';
import { SCHOOL_NAME, TRANSLATIONS } from '../constants';
import { useApp } from '../App';

const Contact: React.FC = () => {
  const { lang, t, settings, addContactMessage } = useApp();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [contactForm, setContactForm] = React.useState({
    name: '',
    mobile: '',
    email: '',
    message: '',
  });

  const handleForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addContactMessage({
        id: `msg-${Date.now()}`,
        name: contactForm.name,
        mobile: contactForm.mobile,
        email: contactForm.email,
        message: contactForm.message,
        status: 'unread',
      });
      setContactForm({ name: '', mobile: '', email: '', message: '' });
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      console.error('Failed to save contact message:', err);
      setSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="inline-block bg-green-100 text-green-700 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em]">Get in Touch</div>
        <h1 className="text-4xl md:text-6xl font-black text-green-900 tracking-tight">{t(TRANSLATIONS.nav.contact)}</h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-xl font-medium">
          {lang === 'bn' 
            ? 'বিদ্যালয় সংক্রান্ত যেকোনো তথ্য বা সাহায্যের জন্য আমাদের সাথে যোগাযোগ করতে পারেন।' 
            : 'For any information or help regarding the school, feel free to contact us.'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Contact Info Cards */}
        <div className="space-y-8">
          {[
            { 
              icon: Phone, 
              title: lang === 'bn' ? 'ফোন করুন' : 'Phone Call', 
              value: settings.phone, 
              color: 'text-green-600', 
              bg: 'bg-green-100' 
            },
            { 
              icon: Mail, 
              title: lang === 'bn' ? 'ইমেইল' : 'Email Address', 
              value: settings.email, 
              color: 'text-blue-600', 
              bg: 'bg-blue-100' 
            },
            { 
              icon: MapPin, 
              title: lang === 'bn' ? 'লোকেশন' : 'Our Location', 
              value: t(settings.location), 
              color: 'text-purple-600', 
              bg: 'bg-purple-100' 
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-50 space-y-6 hover:shadow-xl hover:-translate-y-2 transition-all group">
              <div className={`${item.bg} w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest">{item.title}</h3>
                <p className="text-slate-800 font-black text-lg leading-tight">{item.value}</p>
              </div>
            </div>
          ))}

          <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
               <Clock className="w-32 h-32" />
            </div>
            <h3 className="font-black text-2xl relative z-10">{lang === 'bn' ? 'অফিস সময়সূচী' : 'Office Schedule'}</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-slate-400 font-bold">{lang === 'bn' ? 'শনিবার - বৃহস্পতিবার' : 'Sat - Thu'}</span>
                <span className="font-black">১০:০০ - ৪:০০</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">{lang === 'bn' ? 'শুক্রবার' : 'Friday'}</span>
                <span className="font-black text-red-400 uppercase tracking-widest">{lang === 'bn' ? 'বন্ধ' : 'Closed'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden relative">
          <div className="bg-green-700 p-12 md:p-16 text-white relative">
            <div className="absolute top-0 right-0 p-12 opacity-10"><Globe className="w-40 h-40" /></div>
            <h2 className="text-4xl font-black relative z-10">{lang === 'bn' ? 'আমাদের বার্তা পাঠান' : 'Send a Message'}</h2>
            <p className="opacity-80 mt-2 text-lg font-medium relative z-10">{lang === 'bn' ? 'আপনার জিজ্ঞাসা নিচে লিখে পাঠান।' : 'Send your queries by writing below.'}</p>
          </div>
          
          <form onSubmit={handleForm} className="p-10 md:p-16 space-y-10">
            {sent ? (
              <div className="py-20 flex flex-col items-center text-center space-y-6 animate-in zoom-in">
                 <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center text-green-600 mb-4 shadow-xl">
                   <CheckCircle className="w-12 h-12" />
                 </div>
                 <h3 className="text-3xl font-black text-gray-900">{lang === 'bn' ? 'বার্তটি সফলভাবে পাঠানো হয়েছে!' : 'Message Sent Successfully!'}</h3>
                 <p className="text-gray-500 font-medium max-w-sm">
                   {lang === 'bn' ? 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব। ধন্যবাদ।' : 'We will contact you soon. Thank you.'}
                 </p>
                 <button onClick={() => setSent(false)} className="text-green-700 font-black uppercase text-xs tracking-widest hover:underline mt-4">
                   Send another message
                 </button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{lang === 'bn' ? 'আপনার নাম' : 'Your Name'}</label>
                    <input required type="text" value={contactForm.name} onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))} className="w-full px-6 py-5 rounded-2xl border-2 border-slate-50 focus:border-green-500 outline-none transition-all bg-slate-50/50 font-bold" placeholder="e.g. Abdullah Al Mamun" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}</label>
                    <input required type="tel" value={contactForm.mobile} onChange={e => setContactForm(p => ({ ...p, mobile: e.target.value }))} className="w-full px-6 py-5 rounded-2xl border-2 border-slate-50 focus:border-green-500 outline-none transition-all bg-slate-50/50 font-bold" placeholder="01XXXXXXXXX" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{lang === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}</label>
                  <input type="email" value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} className="w-full px-6 py-5 rounded-2xl border-2 border-slate-50 focus:border-green-500 outline-none transition-all bg-slate-50/50 font-bold" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{lang === 'bn' ? 'আপনার বার্তা' : 'Your Message'}</label>
                  <textarea required rows={5} value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} className="w-full px-6 py-5 rounded-3xl border-2 border-slate-50 focus:border-green-500 outline-none transition-all bg-slate-50/50 font-bold resize-none" placeholder="Write your message here..."></textarea>
                </div>
                
                <button 
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-4 bg-green-700 text-white py-6 rounded-[2.5rem] font-black text-2xl hover:bg-green-800 shadow-2xl shadow-green-700/20 transition-all active:scale-95 ${isSubmitting ? 'opacity-70 grayscale' : ''}`}
                >
                  {isSubmitting ? (
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {lang === 'bn' ? 'মেসেজ পাঠান' : 'Send Message'} <Send className="w-7 h-7" />
                    </>
                  )}
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Embedded Map Section */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-gray-900">{lang === 'bn' ? 'ম্যাপে আমাদের অবস্থান' : 'Find us on Map'}</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t(settings.location)}</p>
        </div>
        <div className="h-[500px] rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-100 grayscale hover:grayscale-0 transition-all duration-1000">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3663.2201977799514!2d91.29177117589574!3d23.235017408375635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37549303d8d6469b%3A0x8e87d15967000e3!2sChauddagram!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
          />
        </div>
      </section>
    </div>
  );
};

export default Contact;
