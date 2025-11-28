const FaqOne = () => {
  return (
    <section className='faq py-120 position-relative'>
      <div className='container'>
        <div className='row gy-4 align-items-center'>
          <div className='col-lg-6 d-lg-block d-none'>
            <div className='faq-thumb'>
              <img
                src='assets/images/thumbs/faq-img.png'
                alt=''
                data-tilt=''
                data-tilt-max={6}
                data-tilt-speed={500}
                data-tilt-perspective={5000}
                data-tilt-full-page-listening=''
              />
            </div>
          </div>
          <div className='col-lg-6'>
            <div className='faq-content'>
              <div className='mb-40'>
                <div className='flex-align d-inline-flex gap-8 mb-16 wow bounceInDown'>
                  <span className='text-main-600 text-2xl d-flex'>
                    <i className='ph-bold ph-book' />
                  </span>
                  <h5 className='text-main-600 mb-0'>
                    Câu Hỏi Thường Gặp (FAQs)
                  </h5>
                </div>
                <h2 className='mb-24 wow bounceIn'>
                  Tìm Câu Trả Lời Cho Câu Hỏi Của Bạn
                </h2>
                <p className='text-neutral-500 text-line-2  wow bounceInUp'>
                  Chào mừng đến với phần Câu Hỏi Thường Gặp! Tại đây, chúng tôi đã tổng hợp câu trả lời cho
                  một số câu hỏi phổ biến nhất mà người dùng của chúng tôi đặt ra.
                </p>
              </div>
              <div className='accordion common-accordion' id='accordionExample'>
                <div
                  className='accordion-item'
                  data-aos='fade-up-left'
                  data-aos-duration={400}
                >
                  <h2 className='accordion-header'>
                    <button
                      className='accordion-button'
                      type='button'
                      data-bs-toggle='collapse'
                      data-bs-target='#collapseOne'
                      aria-expanded='true'
                      aria-controls='collapseOne'
                    >
                      Làm thế nào để đăng ký khóa học?
                    </button>
                  </h2>
                  <div
                    id='collapseOne'
                    className='accordion-collapse collapse show'
                    data-bs-parent='#accordionExample'
                  >
                    <div className='accordion-body'>
                      <p className='accordion-body__desc'>
                        Sau khi bạn đăng ký khóa học, bạn sẽ có quyền truy cập không giới hạn
                        vào tài liệu khóa học miễn là khóa học
                        còn có sẵn trên nền tảng của chúng tôi.
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className='accordion-item'
                  data-aos='fade-up-left'
                  data-aos-duration={600}
                >
                  <h2 className='accordion-header'>
                    <button
                      className='accordion-button collapsed'
                      type='button'
                      data-bs-toggle='collapse'
                      data-bs-target='#collapseTwo'
                      aria-expanded='false'
                      aria-controls='collapseTwo'
                    >
                      Tôi có thể truy cập khóa học trên thiết bị di động không?
                    </button>
                  </h2>
                  <div
                    id='collapseTwo'
                    className='accordion-collapse collapse'
                    data-bs-parent='#accordionExample'
                  >
                    <div className='accordion-body'>
                      <p className='accordion-body__desc'>
                        Có, bạn có thể truy cập các khóa học của mình trên mọi thiết bị di động.
                        Nền tảng của chúng tôi được tối ưu hóa cho điện thoại thông minh và máy tính bảng.
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className='accordion-item'
                  data-aos='fade-up-left'
                  data-aos-duration={800}
                >
                  <h2 className='accordion-header'>
                    <button
                      className='accordion-button collapsed'
                      type='button'
                      data-bs-toggle='collapse'
                      data-bs-target='#collapseThree'
                      aria-expanded='false'
                      aria-controls='collapseThree'
                    >
                      Tôi có thể truy cập khóa học trong bao lâu?
                    </button>
                  </h2>
                  <div
                    id='collapseThree'
                    className='accordion-collapse collapse'
                    data-bs-parent='#accordionExample'
                  >
                    <div className='accordion-body'>
                      <p className='accordion-body__desc'>
                        Sau khi bạn đăng ký khóa học, bạn sẽ có quyền truy cập không giới hạn
                        vào tài liệu khóa học miễn là khóa học
                        còn có sẵn trên nền tảng của chúng tôi.
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className='accordion-item'
                  data-aos='fade-up-left'
                  data-aos-duration={1000}
                >
                  <h2 className='accordion-header'>
                    <button
                      className='accordion-button collapsed'
                      type='button'
                      data-bs-toggle='collapse'
                      data-bs-target='#collapseFour'
                      aria-expanded='false'
                      aria-controls='collapseFour'
                    >
                      Nếu tôi cần giúp đỡ hoặc có câu hỏi trong quá trình học thì sao?
                    </button>
                  </h2>
                  <div
                    id='collapseFour'
                    className='accordion-collapse collapse'
                    data-bs-parent='#accordionExample'
                  >
                    <div className='accordion-body'>
                      <p className='accordion-body__desc'>
                        Chúng tôi có đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn. Bạn có thể liên hệ qua
                        email, chat trực tuyến hoặc diễn đàn cộng đồng để được hỗ trợ.
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className='accordion-item'
                  data-aos='fade-up-left'
                  data-aos-duration={1200}
                >
                  <h2 className='accordion-header'>
                    <button
                      className='accordion-button collapsed'
                      type='button'
                      data-bs-toggle='collapse'
                      data-bs-target='#collapseFive'
                      aria-expanded='false'
                      aria-controls='collapseFive'
                    >
                      Bạn có hoàn tiền nếu tôi không hài lòng với khóa học không?
                    </button>
                  </h2>
                  <div
                    id='collapseFive'
                    className='accordion-collapse collapse'
                    data-bs-parent='#accordionExample'
                  >
                    <div className='accordion-body'>
                      <p className='accordion-body__desc'>
                        Có, chúng tôi cung cấp chính sách hoàn tiền trong vòng 30 ngày nếu bạn không hài lòng.
                        Vui lòng liên hệ với bộ phận hỗ trợ khách hàng để được xử lý.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqOne;
