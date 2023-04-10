import type { NextPage } from "next";
import FAQ from "../../components/support/FAQ";
import { FAQs } from "../../src/support/FAQ";
import { IQuestionAnswer } from "../../src/support/FAQ/models";

const Privacy: NextPage = () => {
  return (
    <div>
      <div className="h-[4vh]">
        {/* padding div for space between top and main elements */}
      </div>

      <div className="dark:text-white">
        <div className="max-w-3xl mx-auto px-4 md:px-0">
          <div className="mb-12 flex flex-col space-y-2">
            <h1 className="text-3xl font-bold sans mb-5">
              Kryptik Privacy Policy
            </h1>
            <h1 className="font-semibold text-xl text-slate-800 dark:text-slate-200">
              Updated: April 9th, 2023
            </h1>
            <p>
              Kryptik is a Free app. This SERVICE is provided by Kryptik at no
              cost and is intended for use as is. This page is used to inform
              visitors regarding our policies with the collection, use, and
              disclosure of Personal Information if anyone decided to use our
              Service. If you choose to use our Service, then you agree to the
              collection and use of information in relation to this policy. The
              Personal Information that we collect is used for providing and
              improving the Service. We will not use or share your information
              with anyone except as described in this Privacy Policy. The terms
              used in this Privacy Policy have the same meanings as in our Terms
              and Conditions, which is accessible at Rainbow unless otherwise
              defined in this Privacy Policy.
            </p>
            <h1 className="font-semibold text-xl">
              Information Collection and Use
            </h1>
            <p>
              For a better experience, while using our Service, we may require
              you to provide us with certain personally identifiable
              information. The information that we request will be retained by
              us and used as described in this privacy policy. The app does use
              third party services that may collect information used to identify
              you.
            </p>
            <h1 className="font-semibold text-xl">Email</h1>
            <p>
              Your email is only used for authentication and account management.
              Your email will not be shared with others except for basic
              authentication requests which may be facilitated by third parties.
            </p>
            <h1 className="font-semibold text-xl">Cookies</h1>
            <p>
              Cookies are files with a small amount of data that are commonly
              used as anonymous unique identifiers. These are sent to your
              browser from the websites that you visit and are stored on your
              device. This Service only uses cookies for session authentication.
            </p>
            <h1 className="font-semibold text-xl">Links to Other Sites</h1>
            <p>
              This Service may contain links to other sites. If you click on a
              third-party link, you will be directed to that site. Note that
              these external sites are not operated by us. Therefore, we
              strongly advise you to review the Privacy Policy of these
              websites. We have no control over and assume no responsibility for
              the content, privacy policies, or practices of any third-party
              sites or services.
            </p>
            <h1 className="font-semibold text-xl">Children's Privacy</h1>
            <p>
              These Services do not address anyone under the age of 13. We do
              not knowingly collect personally identifiable information from
              children under 13. In the case we discover that a child under 13
              has provided us with personal information, we immediately delete
              this from our servers. If you are a parent or guardian and you are
              aware that your child has provided us with personal information,
              please contact us so that we will be able to do necessary actions.
            </p>
            <h1 className="font-semibold text-xl">
              Changes to This Privacy Policy
            </h1>
            <p>
              We may update our Privacy Policy from time to time. Thus, you are
              advised to review this page periodically for any changes. We will
              notify you of any changes by posting the new Privacy Policy on
              this page. These changes are effective immediately after they are
              posted on this page.
            </p>
            <h1 className="font-semibold text-xl">Contact Us</h1>
            <p>
              If you have any questions or suggestions about our Privacy Policy,
              do not hesitate to contact us at support@kryptik.app.
            </p>
          </div>
        </div>
      </div>

      <div className="h-[4rem]">
        {/* padding div for space between top and main elements */}
      </div>
    </div>
  );
};

export default Privacy;
