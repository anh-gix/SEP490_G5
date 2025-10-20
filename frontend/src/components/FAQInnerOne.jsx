const FAQInnerOne = () => {
  return (
    <section className='faq-page py-120'>
      <div className='container'>
        <div className='section-heading text-center'>
          <div className='flex-align d-inline-flex gap-8 mb-16'>
            <span className='text-main-600 text-2xl d-flex'>
              <i className='ph-bold ph-book' />
            </span>
            <h5 className='text-main-600 mb-0'>FAQs</h5>
          </div>
          <h2 className='mb-24'>Find Answers to Your Questions</h2>
          <p className=''>
            Welcome to our FAQs section! Here, we've compiled answers to some of
            the most common questions our users ask.
          </p>
        </div>
        <div className='text-center mb-40'>
          <ul
            className='nav nav-pills common-tab custom-padding d-inline-flex gap-16 bg-white p-12 border border-neutral-30 rounded-pill'
            id='pills-tab'
            role='tablist'
          >
            <li className='nav-item' role='presentation'>
              <button
                className='nav-link rounded-pill bg-main-25 text-md fw-medium text-neutral-500 flex-center w-100 gap-8 active'
                id='pills-onlineEdu-tab'
                data-bs-toggle='pill'
                data-bs-target='#pills-onlineEdu'
                type='button'
                role='tab'
                aria-controls='pills-onlineEdu'
                aria-selected='true'
              >
                <i className='text-xl text-main-600 d-flex ph-bold ph-user' />
                Online Education
              </button>
            </li>
            <li className='nav-item' role='presentation'>
              <button
                className='nav-link rounded-pill bg-main-25 text-md fw-medium text-neutral-500 flex-center w-100 gap-8'
                id='pills-paymentMethod-tab'
                data-bs-toggle='pill'
                data-bs-target='#pills-paymentMethod'
                type='button'
                role='tab'
                aria-controls='pills-paymentMethod'
                aria-selected='false'
              >
                <i className='text-xl text-main-600 d-flex ph-bold ph-graduation-cap' />
                Payment Method
              </button>
            </li>
            <li className='nav-item' role='presentation'>
              <button
                className='nav-link rounded-pill bg-main-25 text-md fw-medium text-neutral-500 flex-center w-100 gap-8'
                id='pills-Pricing-tab'
                data-bs-toggle='pill'
                data-bs-target='#pills-Pricing'
                type='button'
                role='tab'
                aria-controls='pills-Pricing'
                aria-selected='false'
              >
                <i className='text-xl text-main-600 d-flex ph-bold ph-star' />
                Pricing Plan
              </button>
            </li>
          </ul>
        </div>
        <div className='tab-content' id='pills-tabContent'>
          <div
            className='tab-pane fade show active'
            id='pills-onlineEdu'
            role='tabpanel'
            aria-labelledby='pills-onlineEdu-tab'
            tabIndex={0}
          >
            <div className='row gy-4'>
              <div className='col-lg-6'>
                <div
                  className='accordion common-accordion'
                  id='accordionExampleOne'
                >
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseOne'
                        aria-expanded='true'
                        aria-controls='collapseOne'
                      >
                        How do I enroll in a course?
                      </button>
                    </h2>
                    <div
                      id='collapseOne'
                      className='accordion-collapse collapse show'
                      data-bs-parent='#accordionExampleOne'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseTwo'
                        aria-expanded='false'
                        aria-controls='collapseTwo'
                      >
                        Can I access my courses on mobile devices?
                      </button>
                    </h2>
                    <div
                      id='collapseTwo'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleOne'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseThree'
                        aria-expanded='false'
                        aria-controls='collapseThree'
                      >
                        How long do I have access to a course?
                      </button>
                    </h2>
                    <div
                      id='collapseThree'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleOne'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseFour'
                        aria-expanded='false'
                        aria-controls='collapseFour'
                      >
                        What if I need help or have questions during the course?
                      </button>
                    </h2>
                    <div
                      id='collapseFour'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleOne'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseFive'
                        aria-expanded='false'
                        aria-controls='collapseFive'
                      >
                        Do you offer refunds if I'm not satisfied with a course?
                      </button>
                    </h2>
                    <div
                      id='collapseFive'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleOne'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-lg-6'>
                <div
                  className='accordion common-accordion'
                  id='accordionExampleTwooo'
                >
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseTwoEducation'
                        aria-expanded='false'
                        aria-controls='collapseTwoEducation'
                      >
                        Can I access my courses on mobile devices?
                      </button>
                    </h2>
                    <div
                      id='collapseTwoEducation'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleTwooo'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseThreeEducation'
                        aria-expanded='false'
                        aria-controls='collapseThreeEducation'
                      >
                        How long do I have access to a course?
                      </button>
                    </h2>
                    <div
                      id='collapseThreeEducation'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleTwooo'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseOneEducation'
                        aria-expanded='true'
                        aria-controls='collapseOneEducation'
                      >
                        How do I enroll in a course?
                      </button>
                    </h2>
                    <div
                      id='collapseOneEducation'
                      className='accordion-collapse collapse show'
                      data-bs-parent='#accordionExampleTwooo'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseFourEducation'
                        aria-expanded='false'
                        aria-controls='collapseFourEducation'
                      >
                        What if I need help or have questions during the course?
                      </button>
                    </h2>
                    <div
                      id='collapseFourEducation'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleTwooo'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseFiveEducation'
                        aria-expanded='false'
                        aria-controls='collapseFiveEducation'
                      >
                        Do you offer refunds if I'm not satisfied with a course?
                      </button>
                    </h2>
                    <div
                      id='collapseFiveEducation'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleTwooo'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className='tab-pane fade'
            id='pills-paymentMethod'
            role='tabpanel'
            aria-labelledby='pills-paymentMethod-tab'
            tabIndex={0}
          >
            <div className='row gy-4'>
              <div className='col-lg-6'>
                <div
                  className='accordion common-accordion'
                  id='accordionExamplePaymentOne'
                >
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseTwoPaymentOne'
                        aria-expanded='false'
                        aria-controls='collapseTwoPaymentOne'
                      >
                        Can I access my courses on mobile devices?
                      </button>
                    </h2>
                    <div
                      id='collapseTwoPaymentOne'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExamplePaymentOne'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseThreePaymentOne'
                        aria-expanded='false'
                        aria-controls='collapseThreePaymentOne'
                      >
                        How long do I have access to a course?
                      </button>
                    </h2>
                    <div
                      id='collapseThreePaymentOne'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExamplePaymentOne'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseFourPaymentOne'
                        aria-expanded='false'
                        aria-controls='collapseFourPaymentOne'
                      >
                        What if I need help or have questions during the course?
                      </button>
                    </h2>
                    <div
                      id='collapseFourPaymentOne'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExamplePaymentOne'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseFivePaymentOne'
                        aria-expanded='false'
                        aria-controls='collapseFivePaymentOne'
                      >
                        Do you offer refunds if I'm not satisfied with a course?
                      </button>
                    </h2>
                    <div
                      id='collapseFivePaymentOne'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExamplePaymentOne'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseOnePaymentOne'
                        aria-expanded='true'
                        aria-controls='collapseOnePaymentOne'
                      >
                        How do I enroll in a course?
                      </button>
                    </h2>
                    <div
                      id='collapseOnePaymentOne'
                      className='accordion-collapse collapse show'
                      data-bs-parent='#accordionExamplePaymentOne'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-lg-6'>
                <div
                  className='accordion common-accordion'
                  id='accordionExampleTwoPaymentTwo'
                >
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseOnePaymentTwo'
                        aria-expanded='true'
                        aria-controls='collapseOnePaymentTwo'
                      >
                        How do I enroll in a course?
                      </button>
                    </h2>
                    <div
                      id='collapseOnePaymentTwo'
                      className='accordion-collapse collapse show'
                      data-bs-parent='#accordionExampleTwoPaymentTwo'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseTwoPaymentTwo'
                        aria-expanded='false'
                        aria-controls='collapseTwoPaymentTwo'
                      >
                        Can I access my courses on mobile devices?
                      </button>
                    </h2>
                    <div
                      id='collapseTwoPaymentTwo'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleTwoPaymentTwo'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseThreePaymentTwo'
                        aria-expanded='false'
                        aria-controls='collapseThreePaymentTwo'
                      >
                        How long do I have access to a course?
                      </button>
                    </h2>
                    <div
                      id='collapseThreePaymentTwo'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleTwoPaymentTwo'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseFourPaymentTwo'
                        aria-expanded='false'
                        aria-controls='collapseFourPaymentTwo'
                      >
                        What if I need help or have questions during the course?
                      </button>
                    </h2>
                    <div
                      id='collapseFourPaymentTwo'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleTwoPaymentTwo'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseFivePaymentTwo'
                        aria-expanded='false'
                        aria-controls='collapseFivePaymentTwo'
                      >
                        Do you offer refunds if I'm not satisfied with a course?
                      </button>
                    </h2>
                    <div
                      id='collapseFivePaymentTwo'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleTwoPaymentTwo'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className='tab-pane fade'
            id='pills-Pricing'
            role='tabpanel'
            aria-labelledby='pills-Pricing-tab'
            tabIndex={0}
          >
            <div className='row gy-4'>
              <div className='col-lg-6'>
                <div
                  className='accordion common-accordion'
                  id='accordionExampleOnePricingOne'
                >
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseTwoPricingOne'
                        aria-expanded='false'
                        aria-controls='collapseTwoPricingOne'
                      >
                        Can I access my courses on mobile devices?
                      </button>
                    </h2>
                    <div
                      id='collapseTwoPricingOne'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleOnePricingOne'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseOnePricingOne'
                        aria-expanded='true'
                        aria-controls='collapseOnePricingOne'
                      >
                        How do I enroll in a course?
                      </button>
                    </h2>
                    <div
                      id='collapseOnePricingOne'
                      className='accordion-collapse collapse show'
                      data-bs-parent='#accordionExampleOnePricingOne'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseThreePricingOne'
                        aria-expanded='false'
                        aria-controls='collapseThreePricingOne'
                      >
                        How long do I have access to a course?
                      </button>
                    </h2>
                    <div
                      id='collapseThreePricingOne'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleOnePricingOne'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseFourPricingOne'
                        aria-expanded='false'
                        aria-controls='collapseFourPricingOne'
                      >
                        What if I need help or have questions during the course?
                      </button>
                    </h2>
                    <div
                      id='collapseFourPricingOne'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleOnePricingOne'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseFivePricingOne'
                        aria-expanded='false'
                        aria-controls='collapseFivePricingOne'
                      >
                        Do you offer refunds if I'm not satisfied with a course?
                      </button>
                    </h2>
                    <div
                      id='collapseFivePricingOne'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleOnePricingOne'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-lg-6'>
                <div
                  className='accordion common-accordion'
                  id='accordionExampleTwo'
                >
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseTwoEducationPricingTwo'
                        aria-expanded='false'
                        aria-controls='collapseTwoEducationPricingTwo'
                      >
                        Can I access my courses on mobile devices?
                      </button>
                    </h2>
                    <div
                      id='collapseTwoEducationPricingTwo'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleTwo'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseThreePricingTwo'
                        aria-expanded='false'
                        aria-controls='collapseThreePricingTwo'
                      >
                        How long do I have access to a course?
                      </button>
                    </h2>
                    <div
                      id='collapseThreePricingTwo'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleTwo'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseFourPricingTwo'
                        aria-expanded='false'
                        aria-controls='collapseFourPricingTwo'
                      >
                        What if I need help or have questions during the course?
                      </button>
                    </h2>
                    <div
                      id='collapseFourPricingTwo'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleTwo'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseOnePricingTwo'
                        aria-expanded='true'
                        aria-controls='collapseOnePricingTwo'
                      >
                        How do I enroll in a course?
                      </button>
                    </h2>
                    <div
                      id='collapseOnePricingTwo'
                      className='accordion-collapse collapse show'
                      data-bs-parent='#accordionExampleTwo'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='accordion-item'>
                    <h2 className='accordion-header'>
                      <button
                        className='accordion-button collapsed'
                        type='button'
                        data-bs-toggle='collapse'
                        data-bs-target='#collapseFivePricingTwo'
                        aria-expanded='false'
                        aria-controls='collapseFivePricingTwo'
                      >
                        Do you offer refunds if I'm not satisfied with a course?
                      </button>
                    </h2>
                    <div
                      id='collapseFivePricingTwo'
                      className='accordion-collapse collapse'
                      data-bs-parent='#accordionExampleTwo'
                    >
                      <div className='accordion-body'>
                        <p className='accordion-body__desc'>
                          Once you enroll in a course, you'll have unlimited
                          access to the course materials for as long as the
                          course is available on our platform.
                        </p>
                      </div>
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

export default FAQInnerOne;
