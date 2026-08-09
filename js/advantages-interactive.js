/**
 * Advantages Showcase Controller
 * Manages the interactive advantages block, switching tabs, updating the stage,
 * and triggering smooth CSS transitions.
 */

(function () {
  'use strict';

  // SMM-style detailed descriptions with emojis and hashtags
  const advantagesData = [
    {
      image: 'images/advantages/costumes.png',
      title: 'Своя костюмерная с образами',
      description: '🌟 WOW-эффект гарантирован с первой секунды! 👗 Наша костюмерная — это настоящая сокровищница: более 150 премиальных, невероятно детализированных образов (от любимых диснеевских принцесс до супергероев Marvel). Мы используем только профессиональные ткани — дорогой бархат, шелк, мягкий фатин и сверкающие стразы! Каждый костюм проходит регулярную химчистку, отпаривание и выглядит безупречно, будто только что сошел с экрана. Ваш ребенок поверит в чудо на все 100%! ✨\n\n#премиумкостюмы #детскийпраздник #аниматорыспб #праздникподключ',
      btnText: 'Открыть каталог →',
      btnHref: '#characters',
      theme: 'pink'
    },
    {
      image: 'images/advantages/training.png',
      title: 'Постоянное обучение сотрудников',
      description: '🎓 Растим настоящих профессионалов, а не просто любителей! 📚 Мы убеждены: крутой аниматор — это наполовину педагог, наполовину яркий актер. Поэтому все члены нашей команды ежемесячно проходят сертифицированные тренинги: актерское мастерство, сценическая речь, детская психология и бесконфликтное игровое общение. Мы умеем находить подход к самым застенчивым малышам и легко удерживаем фокус внимания даже гиперактивных ребят! 🤫\n\n#профессиональныеаниматоры #обучениеактеров #детскаяпсихология #актерскоемастерство',
      btnText: 'Посмотреть сертификаты →',
      btnHref: '#contact',
      theme: 'gold'
    },
    {
      image: 'images/advantages/team.png',
      title: 'Собственный штат профессиональных аниматоров',
      description: '❤️ Дружная команда мечты, проверенная временем! ⭐ В отличие от большинства агентств, мы категорически не работаем со случайными фрилансерами и подрядчиками "с улицы". У нас собственный постоянный штат харизматичных, энергичных и влюбленных в свое дело аниматоров. Все ребята проходят строгую аттестацию, медицинский контроль и разделяют наши ценности. Вы можете быть абсолютно уверены: к вам приедет именно тот харизматичный артист, которого вы ждали! 🙌\n\n#нашакоманда #штатаниматоров #лучшиеаниматоры #командамечты',
      btnText: 'Познакомиться поближе →',
      btnHref: '#characters',
      theme: 'purple'
    },
    {
      image: 'images/advantages/punctuality.png',
      title: 'Пунктуальность и следование договоренностям',
      description: '⏱️ Спокойствие родителей — наш главный приоритет! ⏰ Никаких опозданий, задержек и испорченных сюрпризов. Наша команда прибывает на площадку строго за 20 минут до начала мероприятия. За это время аниматоры успевают полностью подготовиться, настроить звук, разложить игровой реквизит и переодеться. Программа стартует секунда в секунду! Мы ценим ваше доверие и гарантируем идеальное соблюдение тайминга. 🚗\n\n#пунктуальность #таймингпраздника #всевовремя #беззаботныйпраздник',
      btnText: 'Узнать больше →',
      btnHref: '#contact',
      theme: 'blue'
    },
    {
      image: 'images/advantages/props.png',
      title: 'Тематический реквизит',
      description: '🎨 Игровой реквизит, создающий настоящую магию! 🎯 Забудьте о скучных канатах и потертых мешках из мешковины. Наш реквизит — это гигантские сказочные ключи, светящиеся порталы, сейфы с кодовыми замками и детализированные игровые полотна, созданные нашими дизайнерами. Он полностью погружает ребят в легенду праздника, помогая спасти мир или отыскать пиратские сокровища. Дети играют взахлеб! 🧩\n\n#крутойреквизит #интерактивныеигры #квестыдлядетей #авторскийреквизит',
      btnText: 'Узнать подробнее →',
      btnHref: '#programs',
      theme: 'green'
    },
    {
      image: 'images/advantages/corporate.png',
      title: 'Сотрудничаем с юр. лицами',
      description: '🏢 Доверяйте масштабные события профессионалам коммерческого класса! 💼 Мы имеем огромный опыт проведения крупных массовых мероприятий: от праздников двора и школьных выпускных до корпоративных елок для детей сотрудников ведущих компаний. Работаем полностью официально, заключаем договор, предоставляем все закрывающие документы и принимаем безналичную оплату. С нами легко, надежно и абсолютно прозрачно! 📑\n\n#корпоративы #праздниквшколе #безналичныйрасчет #детскиемероприятия',
      btnText: 'Узнать условия →',
      btnHref: '#contact',
      theme: 'cyan'
    }
  ];

  let activeIndex = 0;
  let isTransitioning = false;

  function initAdvantages() {
    const tabs = document.querySelectorAll('.advantage-tab');
    const stage = document.getElementById('advantages-stage');
    const imageEl = document.getElementById('stage-image');
    const titleEl = document.getElementById('stage-title');
    const descEl = document.getElementById('stage-description');
    const btnEl = document.getElementById('stage-cta-btn');

    if (!tabs.length || !stage) return;

    // Preload stage themes
    const themes = advantagesData.map(item => `theme-${item.theme}`);

    // Preload images to prevent blank flickering during transition
    advantagesData.forEach(item => {
      const img = new Image();
      img.src = item.image;
    });

    function switchTab(index) {
      if (index === activeIndex || isTransitioning) return;

      isTransitioning = true;
      activeIndex = index;
      const data = advantagesData[index];

      // Update active class in tabs list
      tabs.forEach((tab, i) => {
        if (i === index) {
          tab.classList.add('active');
          // Smooth scroll tab into view on mobile (horizontal scrolling tabs)
          try {
            tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          } catch (e) {
            try {
              tab.scrollIntoView(false);
            } catch (err) {}
          }
        } else {
          tab.classList.remove('active');
        }
      });

      // 1. Add animating class to fade/scale out content
      stage.classList.add('animating');

      // 2. Wait for fade-out transition, then update content
      setTimeout(() => {
        try {
          // Remove all theme classes
          themes.forEach(themeClass => stage.classList.remove(themeClass));
          
          // Add new theme class
          stage.classList.add(`theme-${data.theme}`);

          // Update visual illustration & text
          if (imageEl) {
            imageEl.setAttribute('src', data.image);
            imageEl.setAttribute('alt', data.title);
          }
          if (titleEl) titleEl.textContent = data.title;
          
          // Replace newlines with <br> to format bullet points & hashtags correctly
          if (descEl) {
            descEl.innerHTML = data.description.replace(/\n/g, '<br>');
          }
          
          if (btnEl) {
            btnEl.textContent = data.btnText;
            btnEl.setAttribute('href', data.btnHref);
          }
        } catch (error) {
          console.error("Error transitioning advantages stage:", error);
        } finally {
          // 3. Remove animating class to trigger fade-in transition
          stage.classList.remove('animating');

          // Reset transition block lock after fade-in finishes
          setTimeout(() => {
            isTransitioning = false;
          }, 350);
        }

      }, 250); // Timeout matches out CSS transition speed
    }

    // Attach listeners to tabs
    tabs.forEach((tab) => {
      const index = parseInt(tab.dataset.index, 10);

      // On desktop, support hovering for instantaneous slick feel
      tab.addEventListener('mouseenter', () => {
        if (window.innerWidth > 992) {
          switchTab(index);
        }
      });

      // Click/Tap triggers on all devices (mobile + backup desktop)
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(index);
      });
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdvantages);
  } else {
    initAdvantages();
  }

})();
