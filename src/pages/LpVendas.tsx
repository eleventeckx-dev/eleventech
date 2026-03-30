import React, { useState, useEffect } from 'react';
import {
  PhoneCall, Menu, Star, Truck, ShoppingBag,
  MapPin, Leaf, Layers, Users, Clock,
  ArrowRight, Route, CalendarPlus, Map, Monitor, ExternalLink,
  Facebook, Instagram, ChevronDown, CheckCircle2, ChevronRight, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const LpVendas = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('coleta');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    operationSize: '1-5',
    painPoint: ''
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="font-sans text-base antialiased bg-agro-deep text-agro-sand selection:bg-agro-wheat selection:text-slate-950 overflow-x-hidden">

      {/* Sticky Navigation */}
      <header className={`fixed w-full z-50 transition-all duration-300 border-b border-white/5 ${isScrolled ? 'bg-agro-deep/95 backdrop-blur-md shadow-lg py-3' : 'py-4'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">

          {/* Logo */}
          <a href="#" className="flex flex-col items-start group">
            <img
              src="https://ik.imagekit.io/lflb43qwh/ElevenTech/Eleven%20Tech%20Logo.jpeg"
              alt="ElevenTech Logo"
              className="h-24 object-contain rounded-md mb-1 transition-transform group-hover:scale-105"
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm font-medium text-agro-sand/80 hover:text-agro-wheat transition-colors duration-300 tracking-wide">Plataforma</a>
            <a href="#modulos" className="text-sm font-medium text-agro-sand/80 hover:text-agro-wheat transition-colors duration-300 tracking-wide">Módulos</a>
            <a href="#beneficios" className="text-sm font-medium text-agro-sand/80 hover:text-agro-wheat transition-colors duration-300 tracking-wide">Benefícios</a>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a href="#contato" className="flex items-center gap-2 text-sm font-medium text-agro-sand hover:text-agro-wheat transition-colors duration-300">
              <PhoneCall size={20} strokeWidth={1.5} />
              <span className="tracking-wide">Fale Conosco</span>
            </a>
            <a href="#apresentacao" className="bg-agro-wheat text-slate-950 px-6 py-2.5 font-bold text-sm tracking-wide hover:bg-agro-sand transition-colors duration-300 shadow-lg shadow-agro-wheat/20 rounded-md">
              Agendar Apresentação
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-agro-sand p-2 focus:outline-none"
          >
            <Menu size={28} />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-agro-deep/95 backdrop-blur-xl border-t border-white/10 flex flex-col py-4 px-6 gap-4 shadow-2xl">
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-agro-sand hover:text-agro-wheat py-2 border-b border-white/5">A Plataforma</a>
            <a href="#modulos" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-agro-sand hover:text-agro-wheat py-2 border-b border-white/5">Módulos</a>
            <a href="#beneficios" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-agro-sand hover:text-agro-wheat py-2 border-b border-white/5">Benefícios</a>
            <a href="#apresentacao" onClick={() => setIsMobileMenuOpen(false)} className="bg-agro-wheat text-slate-950 text-center px-6 py-3 mt-2 rounded-md font-bold text-sm tracking-wide">Agendar Apresentação</a>
          </div>
        )}
      </header>

      {/* Luxury Hero Section - Split Layout */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-agro-deep/20 blur-[150px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-agro-wheat/10 blur-[120px] -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Hero Content - Left Side */}
          <div className="text-left flex flex-col items-start animate-in fade-in slide-in-from-left-8 duration-1000">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-agro-wheat/30 bg-white/5 backdrop-blur-sm mb-8">
              <Star size={16} className="text-agro-wheat fill-agro-wheat" />
              <span className="text-xs font-semibold tracking-wide text-agro-sand/90">A Escolha das Fazendas Modernas</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-sans font-black text-white leading-[1.1] tracking-tight mb-6 text-balance">
              O Sistema Mais Inteligente para o <span className="text-agro-wheat">Agronegócio</span>
            </h1>

            <p className="text-base md:text-lg text-agro-stone/90 max-w-xl mb-10 font-medium leading-relaxed">
              Tenha controle total da coleta, beneficiamento, estoque e operações financeiras da sua fazenda. Do barracão ao fluxo de caixa, em tempo real.
            </p>

            {/* Service Badges */}
            <div className="flex flex-wrap justify-start gap-4 mb-10 text-[10px] font-bold tracking-widest text-agro-sand/60 uppercase">
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10"><Truck size={14} /> Coleta & Cargas</span>
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10"><Layers size={14} /> Beneficiamento</span>
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10"><Monitor size={14} /> Financeiro & Estoque</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a href="#apresentacao" className="bg-agro-wheat text-slate-950 px-8 py-4 rounded-md font-bold text-sm tracking-wide hover:bg-white hover:-translate-y-1 transition-all duration-300 text-center w-full sm:w-auto shadow-lg shadow-agro-wheat/10">
                Agendar Apresentação
              </a>
              <a href="#modulos" className="bg-transparent border border-white/20 text-agro-sand px-8 py-4 rounded-md font-bold text-sm tracking-wide hover:bg-white/5 hover:border-agro-sand transition-all duration-300 text-center w-full sm:w-auto">
                Explorar Plataforma
              </a>
            </div>
          </div>

          {/* Hero Image - Right Side */}
          <div className="relative flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="relative max-w-[550px] group">
              {/* Outer Glow */}
              <div className="absolute -inset-4 bg-agro-wheat/20 rounded-[2.5rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl transform transition-transform duration-700 group-hover:scale-[1.02]">
                <img
                  src="https://ik.imagekit.io/lflb43qwh/ElevenTech/Eleven%20tech%20estrada.jpg"
                  alt="Eleven Tech Estrada"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
              </div>

              {/* Decorative Frame */}
              <div className="absolute -top-6 -right-6 w-24 h-24 border-t-4 border-r-4 border-agro-wheat/30 rounded-tr-3xl hidden md:block"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 border-b-4 border-l-4 border-agro-wheat/30 rounded-bl-3xl hidden md:block"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Experience Strip */}
      <section className="bg-agro-deep border-y border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-x-auto no-scrollbar gap-12 md:gap-8 justify-start md:justify-center items-center pb-2 md:pb-0">
            {[
              { icon: <Leaf size={20} />, text: 'Tecnologia no Campo' },
              { icon: <Users size={20} />, text: 'Gestão de Produtores' },
              { icon: <Layers size={20} />, text: 'Controle de Barracão' },
              { icon: <Clock size={20} />, text: 'Dados em Tempo Real' },
              { icon: <MapPin size={20} />, text: 'Rastreabilidade Total' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 shrink-0 group cursor-default">
                <div className="w-10 h-10 rounded-full border border-agro-wheat/20 flex items-center justify-center text-agro-wheat group-hover:bg-agro-wheat group-hover:text-agro-forest transition-colors">
                  {item.icon}
                </div>
                <span className="text-sm font-bold text-agro-stone tracking-wide">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Brand Story Section */}
      <section id="about" className="bg-agro-sand text-slate-950 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-12 bg-agro-forest"></div>
                <span className="text-sm font-bold tracking-widest text-agro-grass uppercase">A Plataforma</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-8 text-balance text-agro-forest">
                Construído para Acabar com a Fuga de Dados
              </h2>
              <div className="space-y-6 text-base text-slate-700 font-medium leading-relaxed">
                <p>
                  A ElevenTech nasceu para resolver o problema mais comum de grandes operações rurais e barracões de envasamento: o controle perdido em planilhas e papéis rasgados entre a roça e o admin.
                </p>
                <p>
                  Nossa plataforma une uma interface premium de Coleta de Campo (focada no colaborador e fácil de usar até sob sol forte) com um Backoffice parrudo (Supervisão, Romaneios, Contas a Pagar e Múltiplos Produtores). Nós blindamos a informação para você não perder um grama de produto colhido.
                </p>
                <p>
                  Trazemos inteligência de startups modernas do Vale do Silício pro interior, gerando rastreabilidade nativa, destinação automática de cargas pra estoque ou venda direta, em uma solução única de ponta a ponta.
                </p>
              </div>
            </div>

            {/* Imagery */}
            <div className="order-1 lg:order-2 relative">
              <div className="aspect-[4/5] overflow-hidden group relative rounded-xl shadow-2xl">
                <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000&q=80" alt="Agricultura e Tecnologia" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-4 border-2 border-white/20 rounded-lg pointer-events-none"></div>
              </div>
              {/* Overlapping image */}
              <div className="absolute -bottom-10 -left-10 w-2/3 aspect-square overflow-hidden group border-8 border-agro-sand rounded-xl hidden md:block shadow-2xl">
                <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80" alt="Equipamentos" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Dishes -> Funcionalidades Principais */}
      <section className="bg-agro-deep py-24 lg:py-32 relative border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-agro-deep/40 via-agro-deep/10 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-agro-wheat text-sm font-bold tracking-widest uppercase mb-4 block">Core Features</span>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-6">Módulos Estratégicos</h2>
            <p className="text-agro-stone/70 font-medium">Os 3 pilares da fundação ElevenTech para uma operação imbatível, focada em segurança, agilidade e lucratividade.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <article className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-black">
              <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80" alt="Campo e Coleta" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80 opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                <span className="text-agro-wheat text-xs font-bold tracking-widest uppercase mb-2">Operacional</span>
                <h3 className="text-2xl font-black text-white mb-3 group-hover:text-agro-wheat transition-colors">Coleta de Campo</h3>
                <p className="text-sm text-white/70 font-medium translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">Apontamentos digitais e em tempo real. Identifique rápido os produtores, culturas e garanta que todos os dados cheguem imediatamente à base.</p>
              </div>
            </article>

            {/* Card 2 */}
            <article className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-black">
              <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80" alt="Beneficiamento" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80 opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                <span className="text-agro-wheat text-xs font-bold tracking-widest uppercase mb-2">Logística</span>
                <h3 className="text-2xl font-black text-white mb-3 group-hover:text-agro-wheat transition-colors">Beneficiamento Smart</h3>
                <p className="text-sm text-white/70 font-medium translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">Entrada ágil no barracão. Separe volume para estoque final, linha de produção ou vendas a granel com pesos exatos validados ao limite.</p>
              </div>
            </article>

            {/* Card 3 */}
            <article className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-black">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="Administrativo Dashboard" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80 opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                <span className="text-agro-wheat text-xs font-bold tracking-widest uppercase mb-2">Backoffice</span>
                <h3 className="text-2xl font-black text-white mb-3 group-hover:text-agro-wheat transition-colors">Controle Integrado</h3>
                <p className="text-sm text-white/70 font-medium translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">Contas a pagar automatizadas por fornecedor e destinação de carga. Audite transações e emita seus relatórios do Financeiro facilmente.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Interactive Menu Preview Section -> Aprofundamento */}
      <section id="modulos" className="bg-agro-deep py-24 lg:py-32 relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Mergulhe na Plataforma</h2>
            <p className="text-agro-stone/80 font-medium">Os superpoderes por baixo do painel limpo da ElevenTech.</p>
          </div>

          {/* Menu Tabs */}
          <div className="flex overflow-x-auto no-scrollbar justify-start md:justify-center gap-6 mb-12 border-b border-white/10 pb-4">
            {[
              { id: 'coleta', label: '1. App do Apontador (Coleta)' },
              { id: 'barracao', label: '2. Recepção/Barracão' },
              { id: 'master', label: '3. Admin & Financeiro' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm font-bold tracking-wide whitespace-nowrap transition-colors border-b-2 pb-2 ${activeTab === tab.id ? 'text-agro-wheat border-agro-wheat' : 'text-white/50 border-transparent hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="relative min-h-[300px]">
            {activeTab === 'coleta' && (
              <div className="grid md:grid-cols-2 gap-x-16 gap-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-b border-white/10 pb-4 group">
                  <h4 className="text-lg font-black text-white group-hover:text-agro-wheat transition-colors mb-2">Design "Farm-Style"</h4>
                  <p className="text-sm text-agro-stone/80 font-medium">Contraste ultra-alto com botões superdimensionados desenvolvidos para uso contínuo sob a claridade do Sol no campo.</p>
                </div>
                <div className="border-b border-white/10 pb-4 group">
                  <h4 className="text-lg font-black text-white group-hover:text-agro-wheat transition-colors mb-2">Atualização Dinâmica</h4>
                  <p className="text-sm text-agro-stone/80 font-medium">Os apontamentos no aplicativo sincronizam instantaneamente com o banco de dados principal, mantendo todas as equipes perfeitamente alinhadas.</p>
                </div>
                <div className="border-b border-white/10 pb-4 group">
                  <h4 className="text-lg font-black text-white group-hover:text-agro-wheat transition-colors mb-2">Fluxos Anti-Erro</h4>
                  <p className="text-sm text-agro-stone/80 font-medium">Múltiplos Produtores, Propriedades e Culturas. O app amarra a carga, evitando troca de etiquetas no caminhão.</p>
                </div>
              </div>
            )}

            {activeTab === 'barracao' && (
              <div className="grid md:grid-cols-2 gap-x-16 gap-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-b border-white/10 pb-4 group">
                  <h4 className="text-lg font-black text-white group-hover:text-agro-wheat transition-colors mb-2">Cálculo de Quebras e Destinos</h4>
                  <p className="text-sm text-agro-stone/80 font-medium">Do total da carga (Tarada), separe facilmente peso bruto, frutas verdes e destinações (Estoque final ou Produção em linha).</p>
                </div>
                <div className="border-b border-white/10 pb-4 group">
                  <h4 className="text-lg font-black text-white group-hover:text-agro-wheat transition-colors mb-2">Venda a Granel Instantânea</h4>
                  <p className="text-sm text-agro-stone/80 font-medium">Se uma carga vai direto da recepção para venda Granel sem estocagem, nosso formulário lança o lastro diretamente ao financeiro do painel Admin.</p>
                </div>
                <div className="border-b border-white/10 pb-4 group">
                  <h4 className="text-lg font-black text-white group-hover:text-agro-wheat transition-colors mb-2">Romaneios Digitalizados</h4>
                  <p className="text-sm text-agro-stone/80 font-medium">Conferência unificada eliminando rasuras. O responsável insere os dados e trava o romaneio criptografado internamente.</p>
                </div>
              </div>
            )}

            {activeTab === 'master' && (
              <div className="grid md:grid-cols-2 gap-x-16 gap-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-b border-white/10 pb-4 group">
                  <h4 className="text-lg font-black text-white group-hover:text-agro-wheat transition-colors mb-2">Visualização A Pagar / Pagos</h4>
                  <p className="text-sm text-agro-stone/80 font-medium">O financeiro vê relatórios detalhados com os valores exatos de remuneração para produtores, separados por fretes ou status de fechamento.</p>
                </div>
                <div className="border-b border-white/10 pb-4 group">
                  <h4 className="text-lg font-black text-white group-hover:text-agro-wheat transition-colors mb-2">Controle Total de Tabela de Preços</h4>
                  <p className="text-sm text-agro-stone/80 font-medium">Gestão unificada do valor do produto e frete com regras dinâmicas alteradas facilmente pelo gerente do sistema.</p>
                </div>
                <div className="border-b border-white/10 pb-4 group">
                  <h4 className="text-lg font-black text-white group-hover:text-agro-wheat transition-colors mb-2">Portal Multi-Empresa</h4>
                  <p className="text-sm text-agro-stone/80 font-medium">Organizações e cooperativas grandes rodam através do Super Admin global, garantindo isolamento total por Inquilinos (Tenants).</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Guests Love Us / Benefícios Comerciais */}
      <section id="beneficios" className="bg-agro-sand text-slate-950 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div className="grid grid-cols-2 gap-4">
              <img src="https://ik.imagekit.io/lflb43qwh/ElevenTech/eleventech%20produ%C3%A7%C3%A3o.jpg" alt="Gestão Rural" className="rounded-t-full h-64 md:h-80 object-cover w-full mt-12 shadow-xl border-4 border-white" />
              <img src="https://ik.imagekit.io/lflb43qwh/ElevenTech/produ%C3%A7%C3%A3o%20eleven%20tech.jpg" alt="Caixas de Produto" className="rounded-b-full h-64 md:h-80 object-cover w-full shadow-xl border-4 border-white" />
            </div>

            <div>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-8 text-agro-deep">Por que os Gestores Escolhem a ElevenTech</h2>
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="mt-1 text-agro-grass p-2 bg-agro-grass/10 rounded-full h-fit">
                    <CheckCircle2 size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Cortes Absurdos no Desperdício</h4>
                    <p className="text-sm text-slate-600 font-medium">Com rastreamento instantâneo da coleta à entrega, perdas por furos em romaneios físicos quase zeram em dias e o fechamento do caixa se torna exato.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 text-agro-grass p-2 bg-agro-grass/10 rounded-full h-fit">
                    <CheckCircle2 size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Implantação Ultra Simples</h4>
                    <p className="text-sm text-slate-600 font-medium">Criamos um painel mobile e web desenhado com o feedback do homem do campo. Curva de aprendizado mínima para Apontadores e Responsáveis Técnicos.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 text-agro-grass p-2 bg-agro-grass/10 rounded-full h-fit">
                    <CheckCircle2 size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Escalabilidade Nível Empresa</h4>
                    <p className="text-sm text-slate-600 font-medium">A base tecnológica do Vale do Silício garante que a sua nuvem vai escalar independente de 10 viagens de carreta ou 1.000 ao dia. Servidores altamente resilientes.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Reservation -> Agendar Apresentação (High Conversion) */}
      <section id="apresentacao" className="bg-agro-deep py-24 lg:py-32 border-t border-white/10 relative overflow-hidden">
        {/* Background Graphic */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-agro-grass/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16">

            {/* Sales Info */}
            <div className="text-white">
              <span className="text-agro-wheat text-sm font-bold tracking-widest uppercase mb-4 block">Fale com a gente</span>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-8">Modernize a sua Lavoura Hoje</h2>

              <div className="space-y-6 mb-10 mt-12">
                <p className="text-xl font-medium text-agro-stone/90 mb-4">Deixe nossa equipe mostrar como adaptamos a ElevenTech exatamente para as necessidades do seu barracão de agronegócio ou cooperativa.</p>

                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-white/5 rounded-lg text-agro-wheat"><CheckCircle2 size={24} /></div>
                  <p className="font-medium text-lg text-agro-stone">Migração Guiada e Sem Impacto</p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-white/5 rounded-lg text-agro-wheat"><CheckCircle2 size={24} /></div>
                  <p className="font-medium text-lg text-agro-stone">Treinamento Rápido da Equipe da Ponta</p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-white/5 rounded-lg text-agro-wheat"><CheckCircle2 size={24} /></div>
                  <p className="font-medium text-lg text-agro-stone">Suporte Whatsapp Dedicado e Personalizado</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 pt-8 mt-12">
                <a href="#contato" className="flex-1 bg-white/5 border border-white/20 text-center py-4 rounded-md text-sm font-bold tracking-wide hover:bg-white/10 transition-colors flex justify-center items-center gap-2">
                  <PhoneCall size={18} /> Chamar no WhatsApp
                </a>
              </div>
            </div>

            {/* Demonstration Form */}
            <div className="bg-agro-deep/50 backdrop-blur-md p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl relative">
              <h3 className="text-2xl font-black text-white mb-2">Agendar uma Apresentação Rápida</h3>
              <p className="text-sm text-agro-stone/70 font-medium mb-8">Nossa equipe do comercial vai entrar em contato brevemente para apresentar o sistema na tela para você.</p>

              <form className="space-y-6" onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                  try {
                    const { error } = await supabase.from('leads').insert([{
                      name: formData.name,
                      email: formData.email,
                      phone: formData.phone,
                      operation_size: formData.operationSize,
                      pain_point: formData.painPoint,
                      status: 'new'
                    }]);

                  if (error) throw error;

                  toast.success('Solicitação Recebida!', {
                    description: 'Nosso time entrará em contato em breve para agendarmos o setup.'
                  });
                  setFormData({ name: '', email: '', phone: '', operationSize: '1-5', painPoint: '' });
                } catch (err: any) {
                  console.error('Erro ao enviar lead:', err);
                  toast.error('Erro ao enviar solicitação', {
                    description: 'Por favor, tente novamente ou nos chame no WhatsApp.'
                  });
                } finally {
                  setLoading(false);
                }
              }}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-agro-stone/80 mb-2 tracking-wide uppercase">Nome Completo</label>
                    <input 
                      type="text" 
                      className="w-full bg-agro-deep border border-white/10 rounded-lg p-3 text-white placeholder-white/30 focus:outline-none focus:border-agro-wheat transition-colors text-sm" 
                      placeholder="Ex: João da Silva" 
                      required 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-agro-stone/80 mb-2 tracking-wide uppercase">E-mail Corporativo</label>
                    <input 
                      type="email" 
                      className="w-full bg-agro-deep border border-white/10 rounded-lg p-3 text-white placeholder-white/30 focus:outline-none focus:border-agro-wheat transition-colors text-sm" 
                      placeholder="Ex: joao@fazenda.com" 
                      required 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-agro-stone/80 mb-2 tracking-wide uppercase">Telefone / WhatsApp</label>
                    <input 
                      type="tel" 
                      className="w-full bg-agro-deep border border-white/10 rounded-lg p-3 text-white placeholder-white/30 focus:outline-none focus:border-agro-wheat transition-colors text-sm" 
                      placeholder="(XX) XXXXX-XXXX" 
                      required 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-agro-stone/80 mb-2 tracking-wide uppercase">Tamanho da Operação (Cargas/Dia)</label>
                    <select 
                      className="w-full bg-agro-deep border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-agro-wheat transition-colors text-sm appearance-none cursor-pointer"
                      value={formData.operationSize}
                      onChange={e => setFormData({...formData, operationSize: e.target.value})}
                    >
                      <option value="1-5">Até 5 cargas por dia</option>
                      <option value="5-20">Entre 5 e 20 cargas</option>
                      <option value="20-50">Entre 20 e 50 cargas</option>
                      <option value="50+">Mais de 50 cargas por dia (Enterprise)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-agro-stone/80 mb-2 tracking-wide uppercase">Qual a Maior Dor Hoje?</label>
                    <input 
                      type="text" 
                      className="w-full bg-agro-deep border border-white/10 rounded-lg p-3 text-white placeholder-white/30 focus:outline-none focus:border-agro-wheat transition-colors text-sm" 
                      placeholder="Perda de frete, Erros na contabilidade..." 
                      value={formData.painPoint}
                      onChange={e => setFormData({...formData, painPoint: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-agro-grass text-white py-4 rounded-xl text-base font-black tracking-wide hover:bg-agro-grass/90 hover:-translate-y-1 transition-all duration-300 mt-4 shadow-lg shadow-agro-grass/20 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Solicitar Acesso e Apresentação'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Luxury FAQ Section */}
      <section className="bg-agro-sand text-slate-950 py-24 border-t border-black/5">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight mb-4">Perguntas Frequentes (FAQ)</h2>
            <p className="text-slate-600 font-medium text-sm">Entendendo melhor como o ElevenTech vai operar no seu ambiente rural.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'O aplicativo de Coleta sincroniza rapidamente os dados com o sistema?',
                a: 'Totalmente. O módulo de coleta transmite os apontamentos assim que salvos. Dessa forma a recepção e o escritório recebem as atualizações das cargas da fazenda ou do produtor instantaneamente para faturamento e destinação.'
              },
              {
                q: 'Quais tipos de produtos suportados pelo ElevenTech?',
                a: 'Desde frutas cítricas a grãos de ensacamento. O painel é configurado (no módulo de Produtos) pelo Administrador para adaptar toda matemática das romaneias para o seu produto principal e as métricas de quebra padrão do seu mercado.'
              },
              {
                q: 'Quanto tempo leva para instalarmos o painel e estarmos online?',
                a: 'A implantação é feita em Nuvem SaaS (sem instalar servidores locais caros). Nós fazemos um onboarding que com as informações essenciais (culturas, freteiros) deixa sua equipe usando a partir do primeiro dia útil após setup (em até 48h úteis).'
              },
              {
                q: 'Como controlo múltiplos produtores rurais pagando apenas o que é justo?',
                a: 'O Módulo Financeiro processa o "A Pagar" atrelando taxas descontadas nos painéis, tabelas base do preço e as despesas específicas de carga e descarregamento de cada Produtor atrelado ao registro.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-black/10">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left py-6 flex justify-between items-center focus:outline-none group"
                >
                  <span className="font-bold text-lg group-hover:text-agro-forest transition-colors text-slate-800 pr-8">{faq.q}</span>
                  <ChevronDown className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${activeFaq === idx ? 'rotate-180 text-agro-forest' : ''}`} />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === idx ? 'max-h-[500px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-slate-600 font-medium text-base leading-relaxed pr-8">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Luxury Footer */}
      <footer className="bg-agro-deep border-t border-white/10 pt-20 pb-8 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

            {/* Brand */}
            <div className="lg:col-span-1">
              <a href="#" className="flex flex-col items-start group mb-6">
                <img
                  src="https://ik.imagekit.io/lflb43qwh/ElevenTech/Eleven%20Tech%20Logo.jpeg"
                  alt="Eleven Tech Logo"
                  className="h-28 object-contain rounded-md"
                />
              </a>
              <p className="text-sm text-agro-stone/70 font-medium leading-relaxed mb-6">
                Plataforma corporativa ágil e premium conectando gestão do agronegócio, beneficiamento, finanças e tecnologia de ponta.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-white/50 hover:text-agro-wheat transition-colors"><Facebook size={20} /></a>
                <a href="#" className="text-white/50 hover:text-agro-wheat transition-colors"><Instagram size={20} /></a>
                <a href="#" className="text-white/50 hover:text-agro-wheat transition-colors"><Map size={20} /></a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-black text-lg mb-6 text-agro-wheat">A Plataforma</h4>
              <ul className="space-y-3 text-sm text-agro-stone/80 font-medium">
                <li><a href="#about" className="hover:text-white transition-colors">Visão Geral</a></li>
                <li><a href="#modulos" className="hover:text-white transition-colors">Funcionalidades Principais</a></li>
                <li><a href="#beneficios" className="hover:text-white transition-colors">Benefícios por Setor</a></li>
                <li><a href="#apresentacao" className="hover:text-white transition-colors">Assinar Setup / Reserva</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div id="contato">
              <h4 className="font-black text-lg mb-6 text-agro-wheat">Contato Comercial</h4>
              <ul className="space-y-4 text-sm text-agro-stone/80 font-medium">
                <li className="flex items-start gap-3">
                  <PhoneCall size={18} className="mt-0.5 text-agro-wheat/50 flex-shrink-0" />
                  <a href="#" className="hover:text-white transition-colors">+55 (00) 0000-00000</a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 text-agro-wheat/50 flex-shrink-0" />
                  <span>Sede Operacional,<br />Em breve... Brasil</span>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-black text-lg mb-6 text-agro-wheat">Público Atendido</h4>
              <ul className="space-y-3 text-sm text-agro-stone/80 font-medium">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-agro-wheat rounded-full" /> Fazendas Diretas</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-agro-wheat rounded-full" /> Agronegócios Cooperados</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-agro-wheat rounded-full" /> Atravessadores (Compra e Venda)</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-agro-wheat rounded-full" /> Operações de Barracão</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-agro-stone/50 font-medium">
              &copy; {new Date().getFullYear()} Eleven Tech. Direitos reservados.
            </p>
            <div className="flex gap-4 text-xs text-agro-stone/50 font-medium">
              <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Termos de Serviço</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LpVendas;
